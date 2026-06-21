import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "./RegisterForm";
import { AuthShell, AuthDivider } from "@/components/AuthShell";
import { GoogleButton } from "@/components/GoogleButton";
import { googleEnabled } from "@/lib/env";

export const metadata = { title: "Create your account - Ecom Profit" };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your true marketplace profit."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Suspense>
        {googleEnabled && (
          <>
            <GoogleButton label="Sign up with Google" />
            <AuthDivider />
          </>
        )}
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
