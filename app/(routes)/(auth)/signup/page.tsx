"use client";

import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "convex/react";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContextProvider";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

export default function SignupPage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const completeProfile = useMutation(api.users.completeProfile);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [password, setPassword] = useState("");
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
      const redirectTo = normalizeRedirect(
        sessionStorage.getItem("redirectAfterLogin")
      );
      sessionStorage.removeItem("redirectAfterLogin");
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, user]);

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name || "");
    setAge((prev) =>
      prev || (typeof user.age === "number" ? String(user.age) : "")
    );
    setLocationValue((prev) => prev || user.location || "");
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
            if (!locationValue.trim()) {
              toast.error("Please enter your location.");
              return;
            }
            setSubmitting(true);
            completeProfile({
              name: trimmedName,
              age: parsedAge,
              location: locationValue.trim(),
            })
              .then(() => {
                const redirectTo = normalizeRedirect(
                  sessionStorage.getItem("redirectAfterLogin")
                );
                sessionStorage.removeItem("redirectAfterLogin");
                const destination =
                  redirectTo.includes("/signup") ||
                  redirectTo.includes("/auth")
                    ? normalizeRedirect(null)
                    : redirectTo;
                window.location.href = destination;
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
          <label htmlFor="location">Location</label>
          <Input
            name="location"
            id="location"
            className="mb-4"
            placeholder="Your location"
            value={locationValue}
            onChange={(event) => setLocationValue(event.target.value)}
          />
          <label htmlFor="email">Email</label>
          <Input
            name="email"
            id="email"
            type="email"
            className="mb-4"
            autoComplete="email"
            placeholder="Your email"
            value={user?.email || ""}
            disabled
          />
          <label htmlFor="password">Password</label>
          <Input
            name="password"
            id="password"
            type="password"
            className="mb-6"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" disabled={submitting}>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
