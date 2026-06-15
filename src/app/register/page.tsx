import Link from "next/link";
import { Suspense } from "react";
import { RegisterForm } from "./RegisterForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata = { title: "Create your account — Ecom Profit" };

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
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
