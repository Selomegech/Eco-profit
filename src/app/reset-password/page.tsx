import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata = { title: "Reset password - Ecom Profit" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a new password"
      subtitle="Pick a strong password you don't use anywhere else."
      footer={
        <>
          Changed your mind?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
