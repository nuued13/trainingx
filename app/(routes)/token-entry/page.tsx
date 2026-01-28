"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Lock } from "lucide-react";

export default function TokenEntryPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  
  const validateToken = useQuery(
    api.testTokens.validateToken,
    token.length > 0 ? { token } : "skip"
  );
  
  const incrementRun = useMutation(api.testTokens.incrementTokenRun);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token.trim()) {
      setError("Please enter a token");
      return;
    }

    if (validateToken === undefined) {
      return;
    }

    if (!validateToken.valid) {
      if (validateToken.reason === "max_runs") {
        setError(`Maximum runs reached (${validateToken.runsUsed}/${validateToken.maxRuns}). Please sign up to continue.`);
      } else {
        setError("Invalid token. Please check and try again.");
      }
      return;
    }

    try {
      const result = await incrementRun({ token });
      sessionStorage.setItem("testToken", token);
      sessionStorage.setItem("tokenRuns", result.runsUsed.toString());
      
      if (result.requiresSignup) {
        router.push("/auth?signup=true&token=" + token);
      } else {
        router.push("/assessment-lite?token=" + token);
      }
    } catch (err: any) {
      setError(err.message || "Failed to start session");
    }
  };

  const requiresSignup = validateToken?.reason === "max_runs";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Enter Test Token</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter your test token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full"
              />
            </div>

            {validateToken && validateToken.valid && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Token valid. Runs used: {validateToken.runsUsed}/{validateToken.maxRuns}
                </AlertDescription>
              </Alert>
            )}

            {requiresSignup && (
              <Alert className="border-amber-200 bg-amber-50">
                <Lock className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Maximum runs reached.</strong> To continue, you need to sign up.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={validateToken === undefined || requiresSignup}
            >
              {requiresSignup ? "Sign Up Required" : "Start Session"}
            </Button>

            {requiresSignup && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push("/auth?signup=true&token=" + token)}
              >
                Sign Up to Continue
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
