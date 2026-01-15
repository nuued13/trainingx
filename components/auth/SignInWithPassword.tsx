"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { useState } from "react";
import { ConvexError } from "convex/values";
import { INVALID_PASSWORD } from "convex/errors";
import { normalizeEmail } from "@/lib/auth/normalizeEmail";

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
  const [gender, setGender] = useState("");
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
        const nameValue = (formData.get("name") || "").toString().trim();
        const ageValue = (formData.get("age") || "").toString().trim();
        const genderValue = (formData.get("gender") || "").toString().trim();
        if (flow === "signUp" && !nameValue) {
          toast.error("Please enter your name to sign up.");
          setSubmitting(false);
          return;
        }
        if (flow === "signUp") {
          if (!ageValue) {
            toast.error("Please enter your age to sign up.");
            setSubmitting(false);
            return;
          }
          const parsedAge = Number.parseInt(ageValue, 10);
          if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
            toast.error("Please enter a valid age.");
            setSubmitting(false);
            return;
          }
          if (!genderValue) {
            toast.error("Please select your gender to sign up.");
            setSubmitting(false);
            return;
          }
          formData.set("name", nameValue);
          formData.set("age", ageValue);
          formData.set("gender", genderValue);
        }
        signIn(provider ?? "password", formData)
          .then(() => {
            if (flow === "signUp") {
              handleSent?.(normalizedEmail);
              toast.success("Check your email for a verification code.");
            } else {
              toast.success("You're signed in!");
            }
            // Auth page will handle redirect via useEffect
          })
          .catch((error) => {
            console.error(error);
            if (flow === "signIn") {
              toast.error("Email or password is incorrect.");
              setSubmitting(false);
              return;
            }
            if (
              error instanceof ConvexError &&
              error.data === INVALID_PASSWORD
            ) {
              toast.error("Password doesn't meet the requirements.");
            } else {
              toast.error("Could not create account. Please try again.");
            }
            setSubmitting(false);
          });
      }}
    >
      <label htmlFor="email">Email</label>
      <Input name="email" id="email" className="mb-4" autoComplete="email" />
      {flow === "signUp" && (
        <>
          <label htmlFor="name">Full name</label>
          <Input
            name="name"
            id="name"
            className="mb-4"
            autoComplete="name"
            required={flow === "signUp"}
            placeholder="Your name"
          />
          <label htmlFor="age">Age</label>
          <Input
            name="age"
            id="age"
            type="number"
            min={1}
            className="mb-4"
            placeholder="Your age"
          />
          <label>Gender</label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="mb-4 w-full">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="prefer-not-to-say">
                Prefer not to say
              </SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="gender" value={gender} />
        </>
      )}
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
