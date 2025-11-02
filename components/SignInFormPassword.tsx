import { SignInWithPassword } from "@/auth/SignInWithPassword";
import { Toaster } from "@/components/ui/toaster";
import { SignInWithOAuth } from "@/auth/SignInWithOAuth";

export function SignInFormPassword() {
  return (
    <div className="max-w-[384px] mx-auto flex flex-col gap-4">
      <h2 className="font-semibold text-2xl tracking-tight">
        Sign in or create an account
      </h2>
      <SignInWithOAuth />
      <SignInWithPassword />
      <Toaster />
    </div>
  );
}
