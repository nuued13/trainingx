import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { normalizeEmail } from "@/lib/auth/normalizeEmail";

export function SignInWithEmailCode({
  handleCodeSent,
  provider,
  children,
}: {
  handleCodeSent: (email: string) => void;
  provider?: string;
  children?: React.ReactNode;
}) {
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        const normalizedEmail = normalizeEmail(
          (formData.get("email") || "").toString()
        );
        if (!normalizedEmail) {
          toast.error("Please enter your email.");
          setSubmitting(false);
          return;
        }
        formData.set("email", normalizedEmail);
        const flow = formData.get("flow")?.toString();
        console.log(
          "Attempting sign in with provider:",
          provider ?? "resend-otp"
        );
        signIn(provider ?? "resend-otp", formData)
          .then(() => {
            console.log("Sign in successful");
            handleCodeSent(normalizedEmail);
          })
          .catch((error) => {
            console.log("=== ERROR CAUGHT ===");
            console.log("Full error object:", error);
            console.log("Error message:", error?.message);
            console.log("Error name:", error?.name);
            console.log("Error type:", typeof error);
            console.log("Is Error instance:", error instanceof Error);

            const isResetFlow = flow === "reset";
            const toastDescription = isResetFlow
              ? "Couldn't send a reset code. If your account uses Google sign-in, continue with Google."
              : "Couldn't send the code. Check your email and try again.";

            console.log("About to show toast:", {
              toastDescription,
            });

            toast.error(toastDescription || "Could not send code");
            console.log("Toast called");
            setSubmitting(false);
          });
      }}
    >
      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-8" autoComplete="email" />
      {children}
      <Button type="submit" disabled={submitting}>
        Send code
      </Button>
    </form>
  );
}
