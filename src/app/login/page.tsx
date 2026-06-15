import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata = { title: "Log in — Ecom Profit" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your dashboard."
      footer={
        <>
          New here?{" "}
          <Link href="/register" className="font-semibold text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
