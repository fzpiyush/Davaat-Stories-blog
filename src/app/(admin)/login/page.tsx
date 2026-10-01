import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeftIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";
import { LockClosedIcon } from "@heroicons/react/24/outline";

import heroImage from "@/assets/HeroImage.png";
import GoogleSignInButton from "@/components/admin/GoogleSignInButton";
import { signInWithGoogle } from "@/lib/auth/actions";
import { getLoginErrorMessage } from "@/lib/auth/errors";
import { getCurrentSession } from "@/lib/auth/session";
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
  const { user } = await getCurrentSession();

  if (user) {
    redirect("/admin");
  }

  const { error } = await searchParams;
  const errorMessage = getLoginErrorMessage(error);

  return (
    <main
      aria-labelledby="admin-login-heading"
      className="w-full min-h-dvh px-4 py-10 sm:px-6 flex items-center justify-center text-foreground bg-background relative isolate overflow-hidden"
    >
      {/* Background, same image as the home hero with a frosted blur */}
      <div aria-hidden="true" className="w-full h-full absolute inset-0 -z-10">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center]"
        />

        <div className="w-full h-full bg-background/60 backdrop-blur-md absolute inset-0" />

        <div className="w-full h-full bg-radial from-transparent from-30% to-background absolute inset-0" />
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 lg:p-10 flex flex-col gap-8 bg-surface/90 backdrop-blur-xl shadow-xl border border-border rounded-xl">
        <header className="flex flex-col gap-4">
          <div className="w-12 h-12 flex items-center justify-center text-accent bg-surface-muted rounded-full">
            <LockClosedIcon aria-hidden="true" className="w-6 h-6" />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {SITE_FULL_NAME}
            </p>

            <h1
              id="admin-login-heading"
              className="font-serif text-2xl sm:text-3xl font-semibold text-foreground"
            >
              Admin Login
            </h1>

            <p className="pt-1 text-sm leading-6 text-pretty text-muted">
              Sign in to manage your blogs, stories, comments, and media.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-5">
          {errorMessage && (
            <p
              role="alert"
              className="p-3 flex items-start gap-2 text-sm text-red-600 bg-red-600/10 border border-red-600/20 rounded-lg"
            >
              <ExclamationCircleIcon
                aria-hidden="true"
                className="w-5 h-5 shrink-0"
              />
              {errorMessage}
            </p>
          )}

          <form action={signInWithGoogle}>
            <GoogleSignInButton />
          </form>

          <p className="text-center text-xs text-muted">
            You&apos;ll be redirected to Google to sign in.
          </p>
        </div>

        <div className="pt-6 flex justify-center border-t border-border">
          <Link
            href="/"
            className="w-fit inline-flex items-center gap-1.5 text-sm text-muted rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
          >
            <ArrowLeftIcon
              aria-hidden="true"
              className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1 motion-reduce:transition-none"
            />
            Back to website
          </Link>
        </div>
      </div>
    </main>
  );
}
