import { SignInWithApple } from "@/components/oauth/SignInWithApple";
import { SignInWithGitHub } from "@/components/oauth/SignInWithGitHub";
import { SignInWithGoogle } from "@/components/oauth/SignInWithGoogle";

export function SignInWithOAuth() {
  return (
    <div className="flex flex-col min-[460px]:flex-row w-full gap-2 items-stretch">
      <SignInWithGitHub />
      <SignInWithGoogle />
      <SignInWithApple />
    </div>
  );
}
