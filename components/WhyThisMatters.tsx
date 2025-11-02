import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, DollarSign, Zap } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function WhyThisMatters() {
  const problems = [
    "2.5B prompts daily, most written incorrectly",
    "Companies waste millions on bad AI outputs",
    "Workers spend hours fixing AI mistakes",
    "95% of AI-generated code still needs human cleanup"
  ];

  const opportunities = [
    "Prompt engineers: $95K–$375K salaries",
    "Vibe coders: $66K–$180K (entry level)",
    "Universal skill = unlimited applications",
    "Master one platform, use 200+ AI apps"
  ];

  return (
    <AnimatedSection className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            The AI Skills Gap is{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Costing Billions
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 mb-8">
            Every app, every industry, every career runs on AI now.
          </p>
          
          <p className="text-lg text-gray-700 mb-6">
            ChatGPT. Claude. Microsoft Copilot. Google Gemini. GitHub Copilot. Midjourney. Over 200 tools—and they all require one universal skill: <strong>prompting</strong>.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* The Problem */}
          <AnimatedCard delay={0.2}>
            <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
                <h3 className="text-2xl font-bold text-red-700">The Problem?</h3>
              </div>
              <ul className="space-y-3">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{problem}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          </AnimatedCard>

          {/* The Opportunity */}
          <AnimatedCard delay={0.3}>
            <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-8">
              <div className="flex items-center mb-6">
                <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
                <h3 className="text-2xl font-bold text-green-700">The Opportunity?</h3>
              </div>
              <ul className="space-y-3">
                {opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          </AnimatedCard>
        </div>

        {/* Quote */}
        <div className="text-center mb-12">
          <blockquote className="text-2xl md:text-3xl font-semibold text-gray-800 mb-8">
            "Everyone prompts. Few do it well."
          </blockquote>
          
          <p className="text-lg text-gray-600 mb-8">
            Laid off? Stuck in your career? Want a side hustle? → Prompting is your on-ramp to the AI economy.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-gradient-from to-gradient-to px-8 py-5 text-lg"
            data-testid="button-start-assessment"
          >
            Start Free Assessment
            <Zap className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}