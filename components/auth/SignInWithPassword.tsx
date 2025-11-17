"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from 'react-hot-toast';
import { useState } from "react";
import { ConvexError } from "convex/values";
import { INVALID_PASSWORD } from "convex/errors";

export function SignInWithPassword({
  provider,
  handleSent,
  handlePasswordReset,
  customSignUp: customSignUp,
  passwordRequirements,
}: {
  provider?: string;
  handleSent?: (email: string) => void;
  handlePasswordReset?: () => void;
  customSignUp?: React.ReactNode;
  passwordRequirements?: string;
}) {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);
  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitting(true);
        const formData = new FormData(event.currentTarget);
        signIn(provider ?? "password", formData)
          .then(() => {
            handleSent?.(formData.get("email") as string);
            toast.success("You're signed in!");
            // Auth page will handle redirect via useEffect
          })
          .catch((error) => {
            console.error(error);
            let toastTitle: string;
            let toastDescription: string | undefined;
            
            const errorMessage = error?.message || error?.toString() || "";
            const errorName = error?.name || "";
            
            if (
              error instanceof ConvexError &&
              error.data === INVALID_PASSWORD
            ) {
              toastTitle = "Invalid password";
              toastDescription = "Check the requirements and try again.";
            } else if (
              errorMessage.includes("InvalidAccountId") ||
              errorName === "InvalidAccountId" ||
              (error instanceof Error && error.message.includes("InvalidAccountId"))
            ) {
              toastTitle = "Account not found";
              toastDescription = flow === "signIn"
                ? "This account doesn't exist. Did you mean to sign up?"
                : "Could not create account. Please try again.";
            } else if (
              errorMessage.includes("Invalid") ||
              errorMessage.includes("not found") ||
              errorMessage.includes("does not exist")
            ) {
              toastTitle = flow === "signIn"
                ? "Could not sign in"
                : "Could not sign up";
              toastDescription = flow === "signIn"
                ? "This account doesn't exist. Did you mean to sign up?"
                : "Could not create account. Please try again.";
            } else {
              toastTitle = flow === "signIn"
                ? "Could not sign in"
                : "Could not sign up";
              toastDescription = flow === "signIn"
                ? "Please check your credentials and try again."
                : "Could not create account. Please try again.";
            }
            
            toast.error(toastDescription || "Could not sign in");
            setSubmitting(false);
          });
      }}
    >
      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-4" autoComplete="email" />
      <div className="flex items-center justify-between">
        <label htmlFor="password">Password</label>
        {handlePasswordReset && flow === "signIn" ? (
          <Button
            className="p-0 h-auto"
            type="button"
            variant="link"
            onClick={handlePasswordReset}
          >
            Forgot your password?
          </Button>
        ) : null}
      </div>
      <Input
        type="password"
        name="password"
        id="password"
        autoComplete={flow === "signIn" ? "current-password" : "new-password"}
      />
      {flow === "signUp" && passwordRequirements !== null && (
        <span className="text-gray-500 font-thin text-sm">
          {passwordRequirements}
        </span>
      )}
      {flow === "signUp" && customSignUp}
      <input name="flow" value={flow} type="hidden" />
      <Button type="submit" disabled={submitting} className="mt-4">
        {flow === "signIn" ? "Sign in" : "Sign up"}
      </Button>
      <Button
        variant="link"
        type="button"
        onClick={() => {
          setFlow(flow === "signIn" ? "signUp" : "signIn");
        }}
      >
        {flow === "signIn"
          ? "Don't have an account? Sign up"
          : "Already have an account? Sign in"}
      </Button>
    </form>
  );
}
