import Link from "next/link";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata = { title: "Forgot password - Ecom Profit" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={
        <>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold text-accent hover:underline">
            Back to log in
          </Link>
        </>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
