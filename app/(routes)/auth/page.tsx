"use client";

import { ResetPasswordWithEmailCode } from "@/components/auth/ResetPasswordWithEmailCode";
import { SignInMethodDivider } from "@/components/auth/SignInMethodDivider";
import { SignInWithGoogle } from "@/components/auth/oauth/SignInWithGoogle";
import { SignInWithPassword } from "@/components/auth/SignInWithPassword";
import { Toaster } from "@/components/ui/toaster";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContextProvider";
import { useLocation } from "wouter";

export default function AuthPage() {
  const [step, setStep] = useState<"signIn" | "forgot">("signIn");
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('Auth page: User is authenticated, redirecting...');
      const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
      sessionStorage.removeItem('redirectAfterLogin');
      // Small delay to ensure auth state is fully propagated
      setTimeout(() => {
        console.log('Auth page: Redirecting to', redirectTo);
        setLocation(redirectTo);
      }, 100);
    }
  }, [isAuthenticated, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-[384px] w-full flex flex-col gap-6">
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
              provider="password-with-reset"
              handlePasswordReset={() => setStep("forgot")}
            />
          </>
        ) : (
          <ResetPasswordWithEmailCode
            provider="password-with-reset"
            handleCancel={() => setStep("signIn")}
          />
        )}
        <Toaster />
      </div>
    </div>
  );
}
