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
      alignments: [
        "500+ AI careers",
        "200+ AI businesses",
        "150+ AI side hustles",
        "100+ AI trades",
      ],
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
    <AnimatedSection className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
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

        <div className="grid md:grid-cols-3 gap-8 mb-10">
          {pillars.map((pillar, index) => (
            <AnimatedCard key={index} index={index} delay={0.2}>
              <Card className="text-center hover-elevate h-[450px] lg:h-[350px]">
                <CardContent className="p-8">
                  {/* <div className="bg-gradient-to-r from-gradient-from to-gradient-to text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold">{pillar.number}</span>
                </div> */}

                  <div className="bg-gradient-to-r from-gradient-from to-gradient-to text-white p-3 rounded-lg inline-block mb-4">
                    {pillar.icon}
                  </div>

                  <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                    {pillar.title}
                  </h3>

                  <p className="text-gray-700 mb-4 text-lg">
                    {pillar.description}
                  </p>

                  {pillar.detail && (
                    <p className="text-gray-600 italic">{pillar.detail}</p>
                  )}

                  {pillar.alignments && (
                    <ul className="text-left space-y-2 mt-4">
                      {pillar.alignments.map((alignment, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-2 h-2 bg-gradient-to-r from-gradient-from to-gradient-to rounded-full mr-3"></div>
                          <span className="text-gray-700">{alignment}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>

        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Complete Learning Platform
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformFeatures.map((feature, index) => (
              <AnimatedCard key={index} index={index} delay={0.1}>
                <Card className="hover-elevate h-full">
                  <CardContent className="p-6">
                    <div
                      className={`bg-gradient-to-r ${feature.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mb-4`}
                    >
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Pull Quote */}
        <div className="mb-16 text-center max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-gradient-from/5 to-gradient-to/5 border-gradient-from/20">
            <CardContent className="p-8">
              <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
                "I don't know doesn't exist in the 21st century."
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
