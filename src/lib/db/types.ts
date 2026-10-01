export type UserRole = "admin";

export interface UserRow {
  id: string;
  google_id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: UserRole;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface SessionRow {
  id: string;
  user_id: string;
  expires_at: Date;
  created_at: Date;
}
