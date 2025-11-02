import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlayCircle,
  Trophy,
  Target,
  Zap,
  Star,
  CheckCircle,
  Users,
  BarChart3,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import dashboardImage from "@assets/generated_images/Skills_chart_visualization_cb96a16e.png";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function PracticeZone() {
  const projects = [
    {
      number: 1,
      title: "Spiral Study Buddy",
      category: "Education",
      estTime: "15min",
      color: "from-blue-500 to-blue-600",
      skills: ["Generative AI", "Communication", "Creativity"],
    },
    {
      number: 2,
      title: "Financial Literacy Game",
      category: "Finance",
      estTime: "20min",
      color: "from-green-500 to-green-600",
      skills: ["Agentic AI", "Logic", "Planning"],
    },
    {
      number: 3,
      title: "Website Agent",
      category: "Business",
      estTime: "20min",
      color: "from-purple-500 to-purple-600",
      skills: ["Agentic AI", "Coding", "Planning"],
    },
    {
      number: 4,
      title: "Marketing Copy Agent",
      category: "Marketing",
      estTime: "15min",
      color: "from-orange-500 to-orange-600",
      skills: ["Generative AI", "Creativity", "Communication"],
    },
    {
      number: 5,
      title: "Data Analysis Agent",
      category: "Business",
      estTime: "25min",
      color: "from-red-500 to-red-600",
      skills: ["Synthetic AI", "Analysis", "Logic"],
    },
  ];

  const features = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Live Skill Tracking Across 11 Competencies",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Real-Time Career & Opportunity Matching",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Earn Badges & Professional Certificates",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Build Your AI Project Portfolio",
    },
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "Track Daily Streaks & Progress",
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
    <AnimatedSection id="practice-zone" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Master AI Through
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              {" "}
              Real Projects
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Build actual AI agents while developing 11 critical skills
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-center mb-16">
          {/* Dashboard Preview */}
          <div>
            <Card className="overflow-hidden hover-elevate">
              <CardContent className="p-0">
                <img
                  src={dashboardImage}
                  alt="TrainingX Dashboard - Track Your AI Skills Progress"
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>

            <div className="mt-6 p-6 bg-gradient-to-br from-gradient-from/10 to-gradient-to/10 rounded-lg border border-gradient-from/20">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gradient-from" />
                What You'll Achieve
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-gradient-from mt-0.5 flex-shrink-0" />
                  <span>
                    Track skills across 11 AI & cognitive competencies
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-gradient-from mt-0.5 flex-shrink-0" />
                  <span>Unlock career opportunities as you level up</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-gradient-from mt-0.5 flex-shrink-0" />
                  <span>Build a portfolio of real AI projects</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Projects */}
          <div className="space-y-3">
            {projects.map((project, index) => (
              <AnimatedCard key={index} index={index} delay={0.2}>
                <Card className="hover-elevate">
                  <CardContent className="px-5 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`bg-gradient-to-r ${project.color} text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg`}
                        >
                          {project.number}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {project.title}
                          </h3>
                          <p className="text-gray-600">
                            {project.category} • {project.estTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 justify-end">
                        {project.skills.slice(0, 2).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-5 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover-elevate">
              <CardContent className="p-6">
                <div className="text-green-500 mb-3 flex justify-center">
                  {feature.icon}
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {feature.text}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Platform Features */}
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

        {/* Coming Soon */}
        <div className="text-center mb-12 p-8 bg-gradient-to-br from-gradient-from/5 to-gradient-to/5 rounded-xl border border-gradient-from/10">
          <Badge
            variant="secondary"
            className="mb-4 bg-gradient-to-r from-gradient-from to-gradient-to text-white"
          >
            Coming Soon
          </Badge>
          <h3 className="text-xl md:text-2xl font-bold mb-3">
            Many More Practice Agents
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're constantly adding new AI agents and practice scenarios to
            expand your learning journey. Stay tuned for exciting updates!
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-gradient-from to-gradient-to px-8 py-3 text-lg"
            data-testid="button-start-building"
          >
            Start Building AI Projects
            <Target className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}
