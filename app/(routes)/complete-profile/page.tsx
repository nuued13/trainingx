"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
  { value: "other", label: "Other" },
];

export default function CompleteProfilePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const completeProfile = useMutation(api.users.completeProfile);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      setLocation("/auth");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    if (isLoading || !isAuthenticated || !user) return;
    if (user.needsProfileCompletion !== true) {
      const redirectTo =
        sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
      sessionStorage.removeItem("redirectAfterLogin");
      setLocation(redirectTo);
    }
  }, [isAuthenticated, isLoading, setLocation, user]);

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name || "");
    setGender((prev) => prev || user.gender || "");
    setAge((prev) =>
      prev || (typeof user.age === "number" ? String(user.age) : "")
    );
  }, [user]);

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-[420px] w-full flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-semibold text-2xl tracking-tight">
            Complete your profile
          </h2>
          <p className="text-muted-foreground text-sm">
            Tell us a bit more so we can personalize your experience.
          </p>
        </div>
        <form
          className="flex flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            const trimmedName = name.trim();
            if (!trimmedName) {
              toast.error("Please enter your name.");
              return;
            }
            const parsedAge = Number.parseInt(age, 10);
            if (!Number.isFinite(parsedAge) || parsedAge <= 0) {
              toast.error("Please enter a valid age.");
              return;
            }
            if (!gender) {
              toast.error("Please select your gender.");
              return;
            }
            setSubmitting(true);
            completeProfile({ name: trimmedName, age: parsedAge, gender })
              .then(() => {
                const redirectTo =
                  sessionStorage.getItem("redirectAfterLogin") || "/dashboard";
                sessionStorage.removeItem("redirectAfterLogin");
                const destination =
                  redirectTo === "/complete-profile" || redirectTo === "/auth"
                    ? "/dashboard"
                    : redirectTo;
                setLocation(destination);
              })
              .catch((error) => {
                console.error(error);
                toast.error("Could not save your profile. Please try again.");
                setSubmitting(false);
              });
          }}
        >
          <label htmlFor="name">Full name</label>
          <Input
            name="name"
            id="name"
            className="mb-4"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <label htmlFor="age">Age</label>
          <Input
            name="age"
            id="age"
            type="number"
            min={1}
            className="mb-4"
            placeholder="Your age"
            value={age}
            onChange={(event) => setAge(event.target.value)}
          />
          <label>Gender</label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger className="mb-6 w-full">
              <SelectValue placeholder="Select your gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" disabled={submitting}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
