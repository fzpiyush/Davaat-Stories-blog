import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

import GoogleSignInButton from "@/components/admin/GoogleSignInButton";
import { signInWithGoogle } from "@/lib/auth/actions";
import { SITE_FULL_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

interface AdminLoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
  }>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const { error } = await searchParams;
  const hasError = Boolean(error);

  return (
    <section
      aria-labelledby="admin-login-heading"
      className="w-full min-h-screen flex items-center justify-center p-6 bg-background text-foreground"
    >
      <div className="w-full max-w-md flex flex-col gap-8 p-8 bg-surface border border-border rounded-xl">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-medium text-accent">{SITE_FULL_NAME}</p>

          <h1
            id="admin-login-heading"
            className="font-serif text-3xl font-semibold text-foreground"
          >
            Admin Login
          </h1>

          <p className="pt-1 text-sm leading-6 text-muted">
            Sign in to manage your blogs, stories, comments, and media.
          </p>
        </header>

        <div className="flex flex-col gap-6">
          {hasError && (
            <p
              role="alert"
              className="flex items-start gap-2 p-3 bg-surface-muted rounded-lg text-sm text-red-600"
            >
              <ExclamationCircleIcon
                aria-hidden="true"
                className="w-5 h-5 shrink-0"
              />
              Sign in failed. Please try again.
            </p>
          )}

          <form action={signInWithGoogle}>
            <GoogleSignInButton />
          </form>

          <Link
            href="/"
            className="self-center w-fit inline-flex items-center gap-1.5 rounded-sm text-sm text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
          >
            <ArrowLeftIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
            />
            Back to website
          </Link>
        </div>
      </div>
    </section>
  );
}
