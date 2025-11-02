import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Building2,
  DollarSign,
  Wrench,
  Search,
  Target,
} from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function CareerHub() {
  const opportunities = [
    {
      icon: <Briefcase className="h-8 w-8" />,
      count: "500+",
      label: "AI Careers",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      count: "200+",
      label: "AI businesses",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: <DollarSign className="h-8 w-8" />,
      count: "150+",
      label: "AI Side hustles",
      color: "from-green-500 to-green-600",
    },
    {
      icon: <Wrench className="h-8 w-8" />,
      count: "100+",
      label: "AI Services",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const paths = [
    {
      title: "Browse & Explore",
      description:
        "Discover opportunities across all categories at your own pace",
      icon: <Search className="h-6 w-6" />,
      action: "Explore Career Database",
      variant: "outline" as const,
    },
    {
      title: "Take Assessment → Get Matched",
      description:
        "Get personalized recommendations based on your skills and interests",
      icon: <Target className="h-6 w-6" />,
      action: "Take Matching Assessment",
      variant: "default" as const,
    },
  ];

  return (
    <AnimatedSection id="careers" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Career &{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Opportunity Hub
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Your gateway to the AI economy
          </p>
        </div>

        {/* Database Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {opportunities.map((opportunity, index) => (
            <AnimatedCard key={index} index={index} delay={0.1}>
              <Card className="text-center hover-elevate">
                <CardContent className="p-8">
                  <div
                    className={`bg-gradient-to-r ${opportunity.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    {opportunity.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {opportunity.count}
                  </div>
                  <div className="text-gray-600 font-medium capitalize">
                    {opportunity.label}
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          ))}
        </div>

        {/* Two Paths */}
        <div className="max-w-4xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">
            Choose Your Path
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {paths.map((path, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-r from-gradient-from to-gradient-to text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6">
                    {path.icon}
                  </div>
                  <h4 className="text-xl font-bold mb-4">{path.title}</h4>
                  <p className="text-gray-600 mb-6">{path.description}</p>
                  <Button
                    variant={path.variant}
                    className={
                      path.variant === "default"
                        ? "bg-gradient-to-r from-gradient-from to-gradient-to"
                        : "border-gradient-from text-gradient-from hover:bg-gradient-from hover:text-white"
                    }
                    data-testid={`button-${path.action.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    {path.action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sample Career Cards */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-center mb-6">
            Sample Opportunities
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                title: "AI Prompt Engineer",
                salary: "$95K-$150K",
                type: "Full-time",
              },
              {
                title: "Freelance Content Creator",
                salary: "$50-$200/hr",
                type: "Freelance",
              },
              {
                title: "AI Training Consultant",
                salary: "$5K-$15K/project",
                type: "Contract",
              },
            ].map((job, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-4">
                  <h5 className="font-semibold mb-2">{job.title}</h5>
                  <p className="text-sm text-gray-600 mb-1">{job.salary}</p>
                  <p className="text-xs text-gray-500">{job.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}
