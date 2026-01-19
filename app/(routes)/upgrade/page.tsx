"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Users, Award, TrendingUp, Zap } from "lucide-react";

export default function UpgradePage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<"individual" | "premium">("individual");

  const handleUpgrade = async (tier: string) => {
    console.log("Upgrading to:", tier);
    alert(`Stripe integration coming soon! Selected: ${tier}`);
  };

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Unlock Your AI Success Journey
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your goals and start building your AI-powered career today
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        <Card 
          className={`cursor-pointer transition-all ${
            selectedTier === "individual" 
              ? "border-purple-500 border-2 shadow-lg" 
              : "hover:border-purple-300"
          }`}
          onClick={() => setSelectedTier("individual")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">Individual</CardTitle>
              <Badge variant="default">Most Popular</Badge>
            </div>
            <CardDescription>Perfect for personal AI career development</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => handleUpgrade("individual")}
            >
              Get Started
            </Button>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Complete Digital Thumbprint</p>
                  <p className="text-sm text-muted-foreground">6 core AI skill scores</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">15+ AI Pathway Matches</p>
                  <p className="text-sm text-muted-foreground">Careers, side hustles, trades, businesses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Community Access</p>
                  <p className="text-sm text-muted-foreground">Connect with mentors, peers, collaborators</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">9 Text AI Agents</p>
                  <p className="text-sm text-muted-foreground">Personalized guidance and recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Learning Game Access</p>
                  <p className="text-sm text-muted-foreground">Adaptive flash cards, XP, badges</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Practice Zone</p>
                  <p className="text-sm text-muted-foreground">Build agents, exercises, app recommendations</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Limited Spiral Voice</p>
                  <p className="text-sm text-muted-foreground">2 tutoring sessions per week</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all relative overflow-hidden ${
            selectedTier === "premium" 
              ? "border-purple-500 border-2 shadow-lg" 
              : "hover:border-purple-300"
          }`}
          onClick={() => setSelectedTier("premium")}
        >
          <div className="absolute top-0 right-0 bg-gradient-to-l from-purple-600 to-blue-600 text-white px-4 py-1 text-sm font-semibold">
            BEST VALUE
          </div>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Premium
              <Sparkles className="w-6 h-6 text-purple-500" />
            </CardTitle>
            <CardDescription>For serious AI learners and professionals</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$19.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600" 
              size="lg"
              onClick={() => handleUpgrade("premium")}
            >
              Upgrade to Premium
            </Button>
            <div className="space-y-3">
              <p className="font-semibold text-purple-600">Everything in Individual, plus:</p>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Unlimited Spiral Voice</p>
                  <p className="text-sm text-muted-foreground">24/7 AI tutoring and homework help</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Priority Agent Responses</p>
                  <p className="text-sm text-muted-foreground">Faster, higher quality AI interactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Advanced Analytics</p>
                  <p className="text-sm text-muted-foreground">Deeper skill breakdowns and progress tracking</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Custom Agent Personalities</p>
                  <p className="text-sm text-muted-foreground">Personalize Spiral's tone and style</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium">Priority Support</p>
                  <p className="text-sm text-muted-foreground">Get help faster when you need it</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white max-w-4xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold">Looking for Enterprise or Organization Licensing?</h3>
            <p className="text-gray-300">
              Perfect for schools, Boys & Girls Clubs, workforce development programs
            </p>
            <div className="flex flex-wrap justify-center gap-6 py-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Bulk Learner Management</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span>Custom Pricing</span>
              </div>
            </div>
            <Button 
              size="lg" 
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
              onClick={() => router.push('/contact-sales')}
            >
              Contact Sales
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="max-w-3xl mx-auto mt-16">
        <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Can I cancel anytime?</h4>
            <p className="text-muted-foreground">
              Yes! Cancel anytime with no penalties. Your access continues until the end of your billing period.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">Do you offer refunds?</h4>
            <p className="text-muted-foreground">
              We offer a 7-day money-back guarantee. If you're not satisfied, contact us within 7 days for a full refund.
            </p>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
            <p className="text-muted-foreground">
              We accept all major credit cards, debit cards, and digital payment methods through Stripe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
