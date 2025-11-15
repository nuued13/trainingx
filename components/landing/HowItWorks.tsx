import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  Gamepad2,
  Target,
  Users,
  BarChart3,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function HowItWorks() {
  const pillars = [
    {
      number: "1",
      title: "LEARN",
      icon: <BookOpen className="h-8 w-8" />,
      description: "Short video intros explain each prompting concept.",
      detail: "No fluff. Just what you need to start.",
    },
    {
      number: "2",
      title: "PRACTICE",
      icon: <Gamepad2 className="h-8 w-8" />,
      description: "Game-like drills with Good vs Bad challenges.",
      detail: "Points, badges, and instant feedback close skill gaps.",
    },
    {
      number: "3",
      title: "ALIGN",
      icon: <Target className="h-8 w-8" />,
      description: 'Your "skill thumbprint" matches to:',
      detail: "500+ AI careers, businesses, side hustles, and trades",
    },
  ];
  const platformFeatures = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Custom Agent Builder",
      description: "Create your own AI assistants with custom instructions",
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
      title: "Leaderboard",
      description: "Compete with peers and track your global ranking",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Page",
      description: "Connect, share, and learn with fellow AI enthusiasts",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <AnimatedSection className="py-10 bg-white">
      <div className="max-w-6xl px-4 mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Learn
            </span>
            {" → "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Practice
            </span>
            {" → "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Align
            </span>
          </h2>
          <p className="text-xl text-gray-600">Three pillars of AI mastery</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-10">
          {pillars.map((pillar, index) => (
            <AnimatedCard key={index} index={index} delay={0.2}>
              <Card className="text-center hover-elevate min-h-[380px] max-h-[380px] md:min-h-[310px] md:max-h-[310px]">
                <CardContent className="p-3">
                  {/* <div className="bg-gradient-to-r from-gradient-from to-gradient-to text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">{pillar.number}</span>
                </div> */}

                  <div className="bg-gradient-to-r from-gradient-from to-gradient-to text-white p-3 rounded-lg inline-block mb-2">
                    {pillar.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent leading-tight">
                    {pillar.title}
                  </h3>

                  <p className="text-gray-700 mb-4 text-lg leading-6">
                    {pillar.description}
                  </p>

                  {pillar.detail && (
                    <p className="text-gray-600 italic pt-4">{pillar.detail}</p>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>

        {/* Pull Quote */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-gradient-from/5 to-gradient-to/5 border-gradient-from/20">
            <CardContent className="p-8">
              <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
               {` "I don't know doesn't exist in the 21st century."`}
              </blockquote>
              <p className="text-lg text-gray-600">
                When you master universal prompting, you can handle any AI app
                on the market.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
}
