"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Users,
  BarChart3,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Clock,
  Trophy,
  Loader2,
} from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import {
  ProjectCard,
  usePracticeData,
  useUnlockLogic,
} from "@/components/practice";
import type { PracticeProject, UserStats } from "@/components/practice/types";
import practiceSeedProjects from "@/data/projects-seed.json";

const landingPracticeSlugs = [
  "social-media-content",
  "business-analyst",
  "financial-advisor",
];

const landingPracticeProjectsData = landingPracticeSlugs
  .map((slug) =>
    practiceSeedProjects.find((project) => project.slug === slug)
  )
  .filter(Boolean) as typeof practiceSeedProjects;

const landingPracticeStats: UserStats = {
  promptScore: 92,
  completedProjects: [
    { slug: "social-media-content" },
    { slug: "level-1-assessment" },
    { slug: "level-2-assessment" },
  ],
  badges: ["content-creator", "level-2-complete"],
  weeklyPracticeMinutes: 180,
};

export default function PracticeZone() {
  const { projects, stats, completedSlugs } = usePracticeData(
    landingPracticeProjectsData,
    landingPracticeStats
  );

  const { isLevelUnlocked, isProjectUnlocked } = useUnlockLogic(
    projects,
    completedSlugs,
    stats.promptScore
  );

  // Show 3 real projects from different levels
  const previewProjects = useMemo(() => {
    if (!projects || projects.length === 0) return [];
    
    // Get one project from level 1, 2, and 3 if available
    const byLevel: Record<number, PracticeProject[]> = {};
    projects.forEach(p => {
      if (!byLevel[p.level]) byLevel[p.level] = [];
      byLevel[p.level].push(p);
    });

    const preview: PracticeProject[] = [];
    [1, 2, 3].forEach(level => {
      if (byLevel[level] && byLevel[level].length > 0) {
        preview.push(byLevel[level][0]);
      }
    });

    return preview.slice(0, 3);
  }, [projects]);

  const features = [
    {
      icon: <CheckCircle className="h-7 w-7" />,
      text: "Live Skill Tracking Across 11 Competencies",
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      text: "AI Career & Opportunity Matching",
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      text: "Earn Badges & Professional Certificates",
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      text: "Build Your AI Project Portfolio",
    },
    {
      icon: <CheckCircle className="h-7 w-7" />,
      text: "Track Daily Streaks & Progress",
    },
  ];

  const platformFeatures = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Prompt Rating Game",
      description: "Rate prompts as good, almost, or bad to unlock dynamic difficulty",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Level-Based Assessments",
      description:
        "Progress through levels with comprehensive assessments at each stage",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Adaptive Learning",
      description:
        "AI-powered recommendations based on your skill progression",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Challenges",
      description: "Compete with others and learn from the community",
      color: "from-orange-500 to-orange-600",
    },
  ];

const quizSteps = [
  {
    question: "Primary focus for this month?",
    answer: "Ship a portfolio agent",
  },
  {
    question: "How do you like to learn?",
    answer: "Hands-on projects + sketching ideas",
  },
  {
    question: "Goal for your AI practice?",
    answer: "Build systems that feel human",
  },
];

const trendingSkills = [
  { label: "Generative AI", value: 78 },
  { label: "Communication", value: 72 },
  { label: "Planning", value: 66 },
];

  const [quizStep, setQuizStep] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const quizComplete = quizStep >= quizSteps.length;

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    quizSteps.forEach((_, index) => {
      const timer = setTimeout(() => {
        setQuizStep(index + 1);
      }, 1400 * (index + 1));
      timers.push(timer);
    });

    const analyzingTimer = setTimeout(() => {
      setIsAnalyzing(true);
    }, 4800);
    timers.push(analyzingTimer);

    const completeTimer = setTimeout(() => {
      setIsAnalyzing(false);
    }, 6600);
    timers.push(completeTimer);

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  return (
    <AnimatedSection className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Practice{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Zone
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Build real AI projects, track your skills, unlock opportunities
          </p>
        </div>

        {/* Real Practice Projects Preview */}
        {previewProjects.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Featured Challenges</h3>
              <Button asChild variant="outline">
                <Link href="/practice">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {previewProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  unlocked={isProjectUnlocked(project)}
                  completed={false}
                  stats={stats}
                  isLevelUnlocked={isLevelUnlocked}
                />
              ))}
            </div>
          </div>
        )}

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {platformFeatures.map((feature, idx) => (
            <Card
              key={idx}
              className="bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-lg transition-all duration-300"
            >
              <CardContent className="p-6">
                <div
                  className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 text-white`}
                >
                  {feature.icon}
                </div>
                <h4 className="font-bold text-lg mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Key Features List */}
        <div className="bg-gradient-to-r from-gradient-from/5 to-gradient-to/5 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold mb-6 text-center">
            What You Get
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="text-green-600 mt-1">{feature.icon}</div>
                <span className="text-gray-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto Quiz Preview */}
        {/* <Card className="mb-12 border-gray-200 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Prompting Intelligence Quiz
                </h3>
                <p className="text-sm text-gray-500">
                  Auto-solving a demo assessment to show how matches unlock.
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  quizComplete ? "border-green-500 text-green-600" : ""
                }`}
              >
                {quizComplete ? "Complete" : "Auto-play"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {quizSteps.map((step, idx) => (
              <div
                key={step.question}
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  quizStep > idx
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="text-xs uppercase tracking-wide text-gray-500">
                  Step {idx + 1}
                </div>
                <div className="font-semibold text-gray-800 mb-1">
                  {step.question}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-2">
                  {quizStep > idx ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {step.answer}
                    </>
                  ) : (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      Thinking...
                    </>
                  )}
                </div>
              </div>
            ))}

            <div>
              <Progress value={Math.min((quizStep / quizSteps.length) * 100, 100)} className="h-2" />
              <div className="text-xs text-gray-500 mt-2 text-right">
                {Math.min(Math.round((quizStep / quizSteps.length) * 100), 100)}% complete
              </div>
            </div>

            {isAnalyzing && (
              <div className="flex items-center gap-2 text-sm text-purple-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating personalized matches...
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 border-t border-gray-100 rounded-b-2xl">
            <div className="grid md:grid-cols-3 gap-4 w-full">
              {trendingSkills.map((skill) => (
                <div key={skill.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{skill.label}</span>
                    <span>{skill.value}%</span>
                  </div>
                  <Progress value={skill.value} className="h-1" />
                </div>
              ))}
            </div>
            <div className="col-span-full mt-4 text-center">
              <Button
                asChild
                className="bg-gradient-to-r from-gradient-from to-gradient-to text-white w-full"
              >
                <Link href="/matching">
                  View Real Matches
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card> */}

        {/* CTA */}
        {/* <div className="text-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-gradient-from to-gradient-to text-white"
          >
            <Link href="/practice">
              <Trophy className="mr-2 h-5 w-5" />
              Start Practicing Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div> */}
      </div>
    </AnimatedSection>
  );
}
