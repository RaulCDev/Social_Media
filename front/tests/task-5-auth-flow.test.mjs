import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = async (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

const activeSource = (contents) =>
  contents
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

test("api client exposes backend URLs and keeps cookie sessions", async () => {
  const contents = await source("src/lib/api-client.ts");

  assert.match(contents, /export const apiUrl/);
  assert.match(contents, /credentials:\s*["']include["']/);
  assert.match(contents, /response\.status\s*===\s*401/);
  assert.match(contents, /dispatchEvent/);
});

test("AuthProvider restores and logs out without creating Guest sessions", async () => {
  const contents = activeSource(await source("src/components/AuthProvider.tsx"));

  assert.match(contents, /["']\/auth\/me["']/);
  assert.match(contents, /["']\/auth\/logout["']/);
  assert.match(contents, /loading/);
  assert.doesNotMatch(contents, /auth\/guest|startGuestSession|createGuestSession/);
});

test("login button starts backend GitHub OAuth with the requested label and icon", async () => {
  const contents = activeSource(await source("src/app/page.tsx"));

  assert.match(contents, /Sign in with GitHub/);
  assert.doesNotMatch(contents, /Continue with GitHub/);
  assert.match(contents, /IconBrandGithub/);
  assert.match(contents, /apiUrl\(["']\/auth\/github\/start["']\)/);
  assert.match(contents, /window\.location\.assign/);
  assert.doesNotMatch(contents, /auth\/guest|startGuestSession|No credentials/);
});

test("login translates OAuth error codes into actionable recovery messages", async () => {
  const contents = activeSource(await source("src/app/page.tsx"));

  assert.match(contents, /\.get\(["']oauth_error["']\)/);
  assert.match(contents, /access_denied/);
  assert.match(contents, /GitHub sign-in was cancelled\./);
  assert.match(contents, /invalid_request/);
  assert.match(contents, /invalid_state/);
  assert.match(contents, /Your sign-in request expired\. Please try again\./);
  assert.match(contents, /verified_email_required/);
  assert.match(contents, /Verify an email address on GitHub, then try again\./);
  assert.match(contents, /identity_conflict/);
  assert.match(contents, /That email is already linked to another GitHub account\./);
  assert.match(contents, /provider_unavailable/);
  assert.match(contents, /token_exchange_failed/);
  assert.match(contents, /invalid_provider_response/);
  assert.match(contents, /GitHub is unavailable right now\. Please try again later\./);
  assert.match(contents, /GitHub sign-in could not be completed\. Please try again\./);
});

test("home redirects unauthenticated visitors after session restoration", async () => {
  const contents = activeSource(await source("src/app/home/page.tsx"));

  assert.match(contents, /const\s*\{\s*user,\s*loading\s*\}\s*=\s*useAuth/);
  assert.match(contents, /router\.replace\(["']\/["']\)/);
  assert.match(contents, /if\s*\(loading\)/);
});

test("legacy frontend OAuth callback only redirects to the login page", async () => {
  const contents = activeSource(await source("src/app/github_login/page.tsx"));

  assert.match(contents, /redirect\(["']\/["']\)/);
  assert.doesNotMatch(contents, /github_callback|localStorage|access_token|useSearchParams/);
});

test("active frontend never reads or stores OAuth or application tokens", async () => {
  const paths = [
    "src/app/page.tsx",
    "src/app/home/page.tsx",
    "src/app/github_login/page.tsx",
    "src/components/AuthProvider.tsx",
    "src/lib/session-flow.mjs",
    "src/app/components/Write-Post.tsx",
    "src/app/components/PostCards/Buttons/buttons.tsx",
  ];
  const contents = activeSource((await Promise.all(paths.map(source))).join("\n"));

  assert.doesNotMatch(contents, /localStorage|Authorization|Bearer\s|client_secret/);
  assert.doesNotMatch(contents, /auth\/guest|startGuestSession/);
});

test("profile state accepts the numeric count returned by the typed API client", async () => {
  const contents = await source("src/app/[userName]/page.tsx");

  assert.match(contents, /useState<number\s*\|\s*null>\(null\)/);
});

test("project metadata consistently uses the social_media name", async () => {
  const packageJson = JSON.parse(await source("package.json"));
  const layout = await source("src/app/layout.tsx");
  const compose = await readFile(
    new URL("../../docker-compose.yml", import.meta.url),
    "utf8",
  );

  assert.equal(packageJson.name, "social_media");
  assert.match(layout, /title:\s*["']social_media["']/);
  assert.match(layout, /description:\s*["']social_media/);
  assert.match(compose, /^name:\s*social_media/m);
});

test("Docker isolates Next build artifacts from the development container", async () => {
  const compose = await readFile(
    new URL("../../docker-compose.yml", import.meta.url),
    "utf8",
  );

  assert.match(compose, /-\s*\/usr\/src\/app\/\.next/);
});
