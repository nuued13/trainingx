import { SignInFormEmailCode } from "@/components/auth/SignInFormEmailCode";
import { SignInFormEmailLink } from "@/components/auth/SignInFormEmailLink";
import { SignInFormPasswordAndCustomField } from "@/components/auth/SignInFormPasswordAndCustomField";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// This component is here to showcase different combinations of sign-in methods.
// 1. Choose one of the forms and use it directly instead of this component.
// 2. Delete or add OAuth providers as needed.
// 3. Delete the unused forms.
export function SignInFormsShowcase() {
  return (
    <Tabs defaultValue="otp" className="container flex flex-col mt-10">
      <TabsList className="ml-auto mr-10 mb-1 opacity-60 overflow-x-scroll max-w-full justify-start">
        <TabsTrigger value="otp">OTP</TabsTrigger>
        <TabsTrigger value="link">Magic Link</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="otp">
        <Tabs defaultValue="email" className="flex flex-col">
          <TabsList className="ml-auto mr-10 mb-7 opacity-60">
            <TabsTrigger value="email">Email OTP</TabsTrigger>
          </TabsList>
          <TabsContent value="email">
            {/* Sign in via emailed OTP */}
            <SignInFormEmailCode />
          </TabsContent>
        </Tabs>
      </TabsContent>
      <TabsContent className="mt-20" value="link">
        {/* Sign in via magic link */}
        <SignInFormEmailLink />
      </TabsContent>
      <TabsContent value="password">
        <Tabs defaultValue="custom" className="flex flex-col">
          <TabsList className="ml-auto mr-10 mb-7 opacity-60 overflow-x-scroll max-w-full justify-start">
            <TabsTrigger value="custom">Sign Up</TabsTrigger>
            <TabsTrigger value="password reset">Password Reset</TabsTrigger>
          </TabsList>
          <TabsContent value="custom">
            {/* Email + password and custom field in sign up flow */}
            <SignInFormPasswordAndCustomField />
          </TabsContent>
          <TabsContent value="password reset">
            {/* Email + password, plus password reset via OTP */}
            {/* Note: Password reset via OTP (password-with-reset provider) */}
            <SignInFormPasswordAndCustomField />
          </TabsContent>
        </Tabs>
      </TabsContent>
    </Tabs>
  );
}
