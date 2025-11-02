import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Sparkles, Zap } from "lucide-react";

interface WelcomeScreenProps {
  onStart: (name: string, email: string) => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && userEmail.trim()) {
      onStart(userName, userEmail);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gradient-from to-gradient-to mb-4">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-3">
              Discover Your Prompt IQ
            </h1>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto">
              Take our 2-minute assessment to learn how well you work with AI.
              Get instant insights into your prompting skills!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-medium">
                  What's your name?
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                  className="mt-2 h-12 text-base"
                  data-testid="input-name"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-base font-medium">
                  What's your email?
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  required
                  className="mt-2 h-12 text-base"
                  data-testid="input-email"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">What you'll discover:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Your Prompt Score (0-100)</li>
                    <li>Skill breakdown across 4 key dimensions</li>
                    <li>Personalized improvement recommendations</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gradient-from to-gradient-to h-12 text-base"
              size="lg"
              data-testid="button-start-assessment"
            >
              Start Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              No account required. Your results will be saved for you.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
