import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { AuthShell, AuthDivider } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { googleEnabled } from "@/lib/env";

export const metadata = { title: "Log in - Ecom Profit" };

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
        {googleEnabled && (
          <>
            <GoogleButton label="Continue with Google" />
            <AuthDivider />
          </>
        )}
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
