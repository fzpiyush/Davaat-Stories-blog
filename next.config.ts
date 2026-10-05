import type { NextConfig } from "next";

// Temporary check, remove once the deploy works
const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  console.log("[db check] DATABASE_URL is missing");
} else {
  const trimmed = rawDatabaseUrl.trim();
  console.log(
    "[db check] starts with:",
    trimmed.slice(0, 13),
    "| has extra spaces:",
    trimmed !== rawDatabaseUrl,
  );

  try {
    const parsed = new URL(trimmed);
    console.log("[db check] host:", parsed.hostname, "| port:", parsed.port);
  } catch {
    console.log("[db check] the value is not a valid URL");
  }
}

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  serverExternalPackages: ["knex", "pg"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      // Google profile photos used for the author avatar
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      ...(supabaseHost
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;