import "server-only";

type AuthConfig = {
  googleClientId: string;
  googleClientSecret: string;
  googleRedirectUri: string;
  adminEmails: ReadonlySet<string>;
};

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }

  return value;
}

let cachedConfig: AuthConfig | undefined;

export function getAuthConfig(): AuthConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  cachedConfig = {
    googleClientId: requireEnv("GOOGLE_CLIENT_ID"),
    googleClientSecret: requireEnv("GOOGLE_CLIENT_SECRET"),
    googleRedirectUri: requireEnv("GOOGLE_REDIRECT_URI"),
    adminEmails: new Set(
      requireEnv("ADMIN_EMAILS")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  };

  return cachedConfig;
}
