[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::new()

$containerName = "social_media_migration_002_$PID"
$migration = Get-Content -Raw (Join-Path $PSScriptRoot '002_unique_like_user_post.sql')
$rateLimitMigration = Get-Content -Raw (Join-Path $PSScriptRoot '003_create_rate_limit_bucket.sql')
$guestMigration = Get-Content -Raw (Join-Path $PSScriptRoot '001_add_guest_fields.sql')
$abuseMigration = Get-Content -Raw (Join-Path $PSScriptRoot '004_abuse_controls.sql')

function Invoke-MySql {
    param(
        [Parameter(Mandatory)] [string] $Sql,
        [string] $Database,
        [switch] $ExpectFailure
    )

    $arguments = @(
        'exec', '-i', $containerName,
        'mysql', '-uroot', '--batch', '--skip-column-names'
    )
    if ($Database) {
        $arguments += "--database=$Database"
    }

    $Sql | & docker @arguments
    $exitCode = $LASTEXITCODE
    if ($ExpectFailure -and $exitCode -eq 0) {
        throw 'Expected MySQL command to fail, but it succeeded.'
    }
    if (-not $ExpectFailure -and $exitCode -ne 0) {
        throw "MySQL command failed with exit code $exitCode."
    }
}

try {
    $containerId = & docker run --rm --detach `
        --name $containerName `
        --env MYSQL_ALLOW_EMPTY_PASSWORD=yes `
        mysql:8.0 `
        --skip-log-bin
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not start the temporary MySQL 8 container.'
    }

    $ready = $false
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        & docker exec $containerName sh -c 'grep -qx mysqld /proc/1/comm' 2>$null
        if ($LASTEXITCODE -eq 0) {
            & docker exec $containerName mysqladmin ping -uroot --silent 2>$null
            if ($LASTEXITCODE -eq 0) {
                $ready = $true
                break
            }
        }
        Start-Sleep -Seconds 1
    }
    if (-not $ready) {
        throw 'Temporary MySQL 8 did not become ready.'
    }

    $tableSql = @'
CREATE TABLE `like` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `post_id` INT NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB;
'@

    Invoke-MySql -Sql "CREATE DATABASE clean_check; CREATE DATABASE duplicate_check; CREATE DATABASE rate_limit_check; CREATE DATABASE full_check;"
    Invoke-MySql -Database clean_check -Sql $tableSql
    Invoke-MySql -Database clean_check -Sql $migration
    Invoke-MySql -Database clean_check -Sql $migration

    $indexCount = "SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='clean_check' AND TABLE_NAME='like' AND INDEX_NAME='uq_like_user_post';" |
        & docker exec -i $containerName mysql -uroot --batch --skip-column-names
    if ($LASTEXITCODE -ne 0 -or [int]($indexCount | Select-Object -Last 1) -ne 2) {
        throw 'The expected two-column unique index was not created exactly once.'
    }

    Invoke-MySql -Database clean_check -Sql 'INSERT INTO `like` (`user_id`, `post_id`) VALUES (1, 1);'
    Invoke-MySql -Database clean_check -Sql 'INSERT INTO `like` (`user_id`, `post_id`) VALUES (1, 1);' -ExpectFailure

    Invoke-MySql -Database duplicate_check -Sql $tableSql
    Invoke-MySql -Database duplicate_check -Sql 'INSERT INTO `like` (`user_id`, `post_id`) VALUES (7, 9), (7, 9);'
    Invoke-MySql -Database duplicate_check -Sql $migration -ExpectFailure

    $duplicateState = "SELECT COUNT(*), COUNT(DISTINCT user_id, post_id) FROM duplicate_check.like; SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='duplicate_check' AND TABLE_NAME='like' AND INDEX_NAME='uq_like_user_post';" |
        & docker exec -i $containerName mysql -uroot --batch --skip-column-names
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not verify the historical-duplicate state.'
    }
    $stateLines = @($duplicateState)
    if ($stateLines[0] -ne "2`t1" -or [int]$stateLines[1] -ne 0) {
        throw "Historical duplicates changed unexpectedly: $($stateLines -join '; ')"
    }

    Invoke-MySql -Database rate_limit_check -Sql 'CREATE TABLE `user` (`id` INT NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;'
    Invoke-MySql -Database rate_limit_check -Sql $rateLimitMigration
    Invoke-MySql -Database rate_limit_check -Sql $rateLimitMigration
    $bucketIndexColumns = "SELECT COUNT(*) FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='rate_limit_check' AND TABLE_NAME='rate_limit_bucket' AND INDEX_NAME='uq_rate_limit_identity_action_window';" |
        & docker exec -i $containerName mysql -uroot --batch --skip-column-names
    if ($LASTEXITCODE -ne 0 -or [int]($bucketIndexColumns | Select-Object -Last 1) -ne 3) {
        throw 'Rate-limit migration did not create its three-column identity/action/window key.'
    }

    $baseSchema = @'
CREATE TABLE `user` (`id` INT NOT NULL AUTO_INCREMENT, `email` VARCHAR(100) NOT NULL, `username` VARCHAR(50) NOT NULL, `accountname` VARCHAR(50) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
CREATE TABLE `post` (`id` INT NOT NULL AUTO_INCREMENT, `user_id` INT NOT NULL, `content` TEXT NOT NULL, `father_id` INT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
CREATE TABLE `like` (`id` INT NOT NULL AUTO_INCREMENT, `user_id` INT NOT NULL, `post_id` INT NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB;
INSERT INTO `user` (`email`,`username`,`accountname`) VALUES ('fixture@example.com','fixture','Fixture');
INSERT INTO `post` (`user_id`,`content`) VALUES (1,'fixture post');
INSERT INTO `like` (`user_id`,`post_id`) VALUES (1,1);
'@
    Invoke-MySql -Database full_check -Sql $baseSchema
    foreach ($pass in 1..2) {
        Invoke-MySql -Database full_check -Sql $guestMigration
        Invoke-MySql -Database full_check -Sql $migration
        Invoke-MySql -Database full_check -Sql $rateLimitMigration
        Invoke-MySql -Database full_check -Sql $abuseMigration
    }
    $fixtureState = "SELECT (SELECT COUNT(*) FROM user),(SELECT COUNT(*) FROM post),(SELECT COUNT(*) FROM ``like``),(SELECT COUNT(*) FROM information_schema.TABLES WHERE TABLE_SCHEMA='full_check' AND TABLE_NAME IN ('revoked_token','rate_limit_bucket','abuse_rate_limit_bucket','content_report'));" |
        & docker exec -i $containerName mysql -uroot --database=full_check --batch --skip-column-names
    if ($LASTEXITCODE -ne 0 -or ($fixtureState | Select-Object -Last 1) -ne "1`t1`t1`t4") {
        throw "Full migration fixture verification failed: $fixtureState"
    }

    Write-Output 'PASS: migration 002 is idempotent on clean data, enforces uniqueness, and leaves historical duplicates unchanged on safe failure.'
    Write-Output 'PASS: migration 003 is valid and idempotent on MySQL 8 with its identity/action/window unique key.'
    Write-Output 'PASS: migrations 001-004 are idempotent and preserve user, post, and like fixtures on a temporary MySQL 8 copy.'
}
finally {
    & docker rm --force $containerName 2>$null | Out-Null
}
