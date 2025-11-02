import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Lightbulb, MessageSquare, Palette, Zap } from "lucide-react";
import skillsChart from "@assets/generated_images/Skills_chart_visualization_cb96a16e.png";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function SkillsMastery() {
  const [selectedSkill, setSelectedSkill] = useState(0);

  const coreSkills = [
    {
      name: "Logic",
      icon: <Brain className="h-6 w-6" />,
      score: 85,
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "Critical Thinking",
      icon: <Lightbulb className="h-6 w-6" />,
      score: 78,
      color: "from-purple-500 to-purple-600",
    },
    {
      name: "Clarity",
      icon: <Zap className="h-6 w-6" />,
      score: 92,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      name: "Creativity",
      icon: <Palette className="h-6 w-6" />,
      score: 76,
      color: "from-pink-500 to-pink-600",
    },
    {
      name: "Conversation Design",
      icon: <MessageSquare className="h-6 w-6" />,
      score: 88,
      color: "from-green-500 to-green-600",
    },
  ];

  const supportingSkills = [
    "Tone Control",
    "Data Synthesis",
    "Brevity",
    "Adaptability",
    "Pattern Recognition",
    "Context Building",
    "Iteration",
    "Specificity",
    "Problem Decomposition",
    "Testing",
    "Debugging",
    "Empathy",
    "Systems Thinking",
  ];

  return (
    <AnimatedSection className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            The Big Five +{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              13 Supporting Skills
            </span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-10">
          {/* Skills Chart */}
          <div className="text-center">
            <Card className="p-8 hover-elevate">
              <CardContent className="p-0">
                <img
                  src={skillsChart}
                  alt="Skills Chart Visualization"
                  className="w-full h-auto rounded-lg mb-6"
                />
                <p className="text-gray-600 italic">
                  Your skill thumbprint visualization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Skills Interactive List */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold mb-2">Core Skills</h3>
            {coreSkills.map((skill, index) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all hover-elevate ${
                  selectedSkill === index ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedSkill(index)}
                data-testid={`skill-card-${skill.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="py-3 px-5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`bg-gradient-to-r ${skill.color} text-white p-2 rounded-lg`}
                      >
                        {skill.icon}
                      </div>
                      <span className="text-base font-semibold">
                        {skill.name}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-700">
                      {skill.score}%
                    </span>
                  </div>
                  <Progress
                    value={skill.score}
                    className="h-3"
                    data-testid={`progress-${skill.name.toLowerCase().replace(/\s+/g, "-")}`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Supporting Skills Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Supporting Skills
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {supportingSkills.map((skill, index) => (
              <Card key={index} className="text-center hover-elevate">
                <CardContent className="p-4">
                  <span className="text-sm font-medium text-gray-700">
                    {skill}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-gradient-from to-gradient-to px-8 py-3 text-lg"
            data-testid="button-view-skill-report"
          >
            View Sample Skill Report
            <Zap className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}
