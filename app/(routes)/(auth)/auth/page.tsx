"use client";

import { ResetPasswordWithEmailCode } from "@/components/auth/ResetPasswordWithEmailCode";
import { SignInMethodDivider } from "@/components/auth/SignInMethodDivider";
import { SignInWithGoogle } from "@/components/auth/oauth/SignInWithGoogle";
import { SignInWithPassword } from "@/components/auth/SignInWithPassword";
import { CodeInput } from "@/components/auth/CodeInput";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useLocation } from "wouter";
import { useAuthActions } from "@convex-dev/auth/react";
import toast from "react-hot-toast";

const getAppURL = () => {
  if (typeof window === "undefined") return "https://staging.trainingx.ai";
  return window.location.origin;
};

const normalizeRedirect = (value?: string | null): string => {
  const appURL = getAppURL();
  if (!value) return `${appURL}/dashboard`;
  
  // If it's a relative path, use app URL
  if (value.startsWith("/")) {
    return `${appURL}${value}`;
  }
  
  // If it's already an absolute URL, use it as-is
  if (value.startsWith("http")) {
    return value;
  }
  
  return `${appURL}/dashboard`;
};

export default function AuthPage() {
  const [step, setStep] = useState<"signIn" | { email: string } | "forgot">(
    "signIn"
  );
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const { signIn } = useAuthActions();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      console.log("Auth page: User is authenticated, redirecting...");
      const needsProfileCompletion = user.needsProfileCompletion === true;
      const redirectTo = needsProfileCompletion
        ? "/signup"
        : sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      if (!needsProfileCompletion) {
        sessionStorage.removeItem("redirectAfterLogin");
      }
      
      // Reset all forms and remove any beforeunload listeners
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        if (form instanceof HTMLFormElement) {
          form.reset();
          // Mark form as pristine
          const inputs = form.querySelectorAll('input, textarea, select');
          inputs.forEach(input => {
            if (input instanceof HTMLInputElement || 
                input instanceof HTMLTextAreaElement || 
                input instanceof HTMLSelectElement) {
              input.defaultValue = input.value;
            }
          });
        }
      });
      
      // Remove any beforeunload event listeners
      window.onbeforeunload = null;
      
      // Use Next.js router for client-side navigation
      setLocation(redirectTo);
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-[420px] w-full flex flex-col gap-6">
        <div>
          <Button
            variant="outline"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            ← Back to Home
          </Button>
        </div>
        {step === "signIn" ? (
          <>
            <div className="text-center">
              <h2 className="font-semibold text-2xl tracking-tight">
                Sign in or create an account
              </h2>
            </div>
            <SignInWithGoogle />
            <SignInMethodDivider />
            <SignInWithPassword
              provider="password-code"
              handleSent={(email) => setStep({ email })}
              handlePasswordReset={() => setStep("forgot")}
            />
          </>
        ) : step === "forgot" ? (
          <ResetPasswordWithEmailCode
            provider="password-code"
            handleCancel={() => setStep("signIn")}
          />
        ) : (
          <>
            <h1 className="font-semibold text-4xl tracking-tight">
              Check your email
            </h1>
            <p className="text-muted-foreground text-base">
              Enter the 8-digit code we sent to your email address to verify
              your account.
            </p>
            <form
              className="flex flex-col"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitting(true);
                const formData = new FormData(event.currentTarget);
                signIn("password-code", formData)
                  .then(() => {
                    toast.success("Email verified! You're signed in.");
                  })
                  .catch((error) => {
                    console.error(error);
                    toast.error("Code could not be verified, try again");
                    setSubmitting(false);
                  });
              }}
            >
              <label htmlFor="code" className="text-base font-semibold mb-4">
                Verification Code
              </label>
              <CodeInput />
              <input name="email" value={step.email} type="hidden" />
              <input name="flow" value="email-verification" type="hidden" />
              <Button type="submit" disabled={submitting} className="mt-8">
                Verify Email
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setStep("signIn")}
              >
                Cancel
              </Button>
            </form>
          </>
        )}
        <Toaster />
      </div>
    </div>
  );
}
