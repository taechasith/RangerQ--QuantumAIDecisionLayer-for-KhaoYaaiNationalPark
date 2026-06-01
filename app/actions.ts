"use server";

import { redirect } from "next/navigation";

import { clearSession, setSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "").trim();
  const expectedEmail = String(process.env.DEMO_ADMIN_EMAIL || "admin@rangerq.local").trim().toLowerCase();
  const expectedPassword = String(process.env.DEMO_ADMIN_PASSWORD || "change-this-password").trim();

  // Secure debug log for Vercel Runtime Logs
  console.log("Auth Debug Details:", {
    inputEmail: email,
    inputEmailLength: email.length,
    expectedEmail: expectedEmail,
    expectedEmailLength: expectedEmail.length,
    passwordsMatch: password === expectedPassword,
    fallbackInUse: !process.env.DEMO_ADMIN_EMAIL
  });

  if (email !== expectedEmail || password !== expectedPassword) {
    redirect("/login?error=invalid");
  }

  await setSession({
    email,
    name: "RangerQ Admin",
    role: "ADMIN",
  });

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
