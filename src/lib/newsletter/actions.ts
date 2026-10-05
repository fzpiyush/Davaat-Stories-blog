"use server";

import { subscribeEmail } from "@/lib/db/subscribers";

export type SubscribeState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export async function subscribe(
  _prevState: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return {
      status: "error",
      message: "Please enter a valid email address.",
    };
  }

  try {
    await subscribeEmail(email);
  } catch (error) {
    console.error("Newsletter signup failed", error);

    return {
      status: "error",
      message:
        "Something went wrong on our side. Please try again in a moment.",
    };
  }

  // Same message for new and existing emails, so nobody can check who's on the list
  return {
    status: "success",
    message: "You're in. Watch your inbox for the next post.",
  };
}
