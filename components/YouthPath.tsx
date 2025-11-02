import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Shield, Heart, Star, CheckCircle } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function YouthPath() {
  const features = [
    { icon: <GraduationCap className="h-6 w-6" />, title: "Age-Appropriate", description: "Designed specifically for grades 6-8" },
    { icon: <Shield className="h-6 w-6" />, title: "Safe Environment", description: "Secure, monitored learning space" },
    { icon: <Heart className="h-6 w-6" />, title: "Fun & Engaging", description: "Visual-first challenges that kids love" },
    { icon: <Star className="h-6 w-6" />, title: "Career Ready", description: "Building tomorrow's AI professionals" }
  ];

  return (
    <AnimatedSection className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Youth Path{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              (Grades 6–8)
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Visual-first, age-appropriate challenges → Safe, fun, career-ready.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover-elevate bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sample Activities */}
        <div className="max-w-4xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Sample Activities</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: "AI Pet Creator", description: "Design and train your own virtual AI companion", difficulty: "Beginner" },
              { title: "Story Helper", description: "Work with AI to write amazing adventure stories", difficulty: "Beginner" },
              { title: "Smart Study Buddy", description: "Build an AI that helps with homework and learning", difficulty: "Intermediate" }
            ].map((activity, index) => (
              <Card key={index} className="hover-elevate bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h4 className="text-lg font-semibold mb-2">{activity.title}</h4>
                  <p className="text-gray-600 mb-4 text-sm">{activity.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                      {activity.difficulty}
                    </span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Parent Info */}
        <div className="max-w-3xl mx-auto mb-8">
          <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-200">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">For Parents & Educators</h3>
              <p className="text-gray-700 mb-6">
                Give your child a head start in the AI economy with our safe, supervised learning environment. 
                All activities are designed by education experts and include progress tracking for parents.
              </p>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> COPPA Compliant</div>
                <div className="flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Parent Dashboard</div>
                <div className="flex items-center justify-center"><CheckCircle className="h-4 w-4 text-green-500 mr-2" /> Progress Reports</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 text-lg"
            data-testid="button-explore-youth-mode"
          >
            Explore Youth Mode
            <GraduationCap className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}