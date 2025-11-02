import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  Calendar,
  Users,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import AnimatedSection from "./AnimatedSection";

export default function TrackRecord() {
  const timeline = [
    {
      year: "2015",
      title: "Launched Spiral (study buddy)",
      result: "70%+ student improvement rates",
      icon: <Lightbulb className="h-5 w-5" />,
    },
    {
      year: "2017",
      title: "Expanded to NuuedScore",
      result: "Trained thousands in critical thinking",
      icon: <Users className="h-5 w-5" />,
    },
    {
      year: "2020",
      title: "Evolved to TrainingX.Ai",
      result: "AI literacy for organizations",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      year: "2023",
      title: "Launched PromptToSuccess",
      result: "Career-focused training",
      icon: <CheckCircle className="h-5 w-5" />,
    },
    {
      year: "2025",
      title: "Universal Practice Zone",
      result: "Game-changing platform for all ages",
      icon: <Calendar className="h-5 w-5" />,
    },
  ];

  const proofPoints = [
    "10 years of measurable results",
    "Schools, nonprofits, and organizations trust us",
    "70%+ improvement rates across all programs",
    "Continuous evolution with AI advancement",
  ];

  return (
    <AnimatedSection id="track-record" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            A Decade of{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Proven Results
            </span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gradient-from to-gradient-to transform md:-translate-x-px"></div>

            {timeline.map((item, index) => (
              <div key={index} className="relative mb-2 last:mb-0">
                <div
                  className={`flex items-start ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-gradient-to-r from-gradient-from to-gradient-to rounded-full transform -translate-x-1.5 md:-translate-x-1.5 z-10"></div>

                  {/* Content */}
                  <Card
                    className={`ml-12 md:ml-0 md:w-5/12 ${index % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <div className="bg-gradient-to-r from-gradient-from to-gradient-to text-white p-2 rounded-lg mr-3">
                          {item.icon}
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
                          {item.year}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">{item.result}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proof Points */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {proofPoints.map((point, index) => (
            <Card key={index} className="text-center hover-elevate">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
                <p className="font-medium">{point}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quote */}
        <div className="text-center max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-gradient-from/5 to-gradient-to/5 border-gradient-from/20">
            <CardContent className="p-8">
              <blockquote className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                "We've been training people in AI thinking skills since before
                ChatGPT existed. Now we're ready to scale globally."
              </blockquote>
              <cite className="text-gray-600 font-medium">
                — TrainingX.Ai Team
              </cite>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
}
