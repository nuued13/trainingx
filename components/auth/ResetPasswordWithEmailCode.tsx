import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { CodeInput } from "@/components/auth/CodeInput";
import { SignInWithEmailCode } from "@/components/auth/SignInWithEmailCode";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { normalizeEmail } from "@/lib/auth/normalizeEmail";

export function ResetPasswordWithEmailCode({
  handleCancel,
  provider,
}: {
  handleCancel: () => void;
  provider: string;
}) {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");
  const [submitting, setSubmitting] = useState(false);
  return step === "forgot" ? (
    <>
      <h2 className="font-semibold text-3xl tracking-tight">
        Send password reset code
      </h2>
      <SignInWithEmailCode
        handleCodeSent={(email) => setStep({ email })}
        provider={provider}
      >
        <input name="flow" type="hidden" value="reset" className="" />
      </SignInWithEmailCode>
      <Button
        type="button"
        variant="link"
        onClick={handleCancel}
        className="-mt-4"
      >
        Cancel
      </Button>
    </>
  ) : (
    <>
      <h2 className="font-semibold text-3xl tracking-10">Check your email</h2>
      <p className="text-muted-foreground">
        Enter the 8-digit code we sent to your email address and choose a new
        password.
      </p>
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitting(true);
          const formData = new FormData(event.currentTarget);
          formData.set(
            "email",
            normalizeEmail((formData.get("email") || "").toString())
          );
          signIn(provider, formData).catch((error) => {
            console.error(error);
            const errorMessage = error?.message || error?.toString() || "";
            let toastDescription = "Reset failed. Please try again.";
            if (
              errorMessage.includes("Invalid") ||
              errorMessage.includes("incorrect") ||
              errorMessage.includes("wrong")
            ) {
              toastDescription = "Invalid code. Please try again.";
            } else if (
              errorMessage.includes("password") ||
              errorMessage.includes("too short") ||
              errorMessage.includes("requirements")
            ) {
              toastDescription =
                "Password doesn't meet the requirements. Please try again.";
            }

            toast.error(toastDescription);
            setSubmitting(false);
          });
        }}
      >
        <label htmlFor="email">Code</label>
        <CodeInput />
        <label htmlFor="newPassword">New Password</label>
        <Input
          type="password"
          name="newPassword"
          id="newPassword"
          className="mb-8"
          autoComplete="new-password"
        />
        <input type="hidden" name="flow" value="reset-verification" />
        <input type="hidden" name="email" value={step.email} />
        <Button type="submit" disabled={submitting}>
          Continue
        </Button>
        <Button type="button" variant="link" onClick={() => setStep("forgot")}>
          Cancel
        </Button>
      </form>
    </>
  );
}
