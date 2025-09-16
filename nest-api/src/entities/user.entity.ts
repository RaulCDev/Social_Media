export class User {
  // TypeORM entity for the users table (email, username, accountname, avatarUrl, access_token)
  id!: number;
  email!: string;
  username!: string;
  accountname!: string;
  avatarUrl!: string;
  access_token!: string | null;
}
