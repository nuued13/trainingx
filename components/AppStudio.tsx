import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Star, Award, ExternalLink } from "lucide-react";
import appStudioImage from "@assets/generated_images/App_studio_projects_74222fd3.png";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function AppStudio() {
  const apps = [
    { name: "Spiral the Study Buddy", badge: "Flagship", featured: true },
    { name: "Animated Movie Maker", badge: "Popular" },
    { name: "Music Video Creator", badge: "Creative" },
    { name: "Book Builder", badge: "Writing" },
    { name: "Logo Generator", badge: "Design" },
    { name: "Website Builder", badge: "Tech" },
    { name: "Resume Builder", badge: "Career" },
    { name: "Presentation Maker", badge: "Business" },
    { name: "Marketing Copy Agent", badge: "Marketing" },
    { name: "Finance Coach", badge: "Finance" },
    { name: "Grant Finder", badge: "Funding" },
    { name: "Podcast Script", badge: "Content" },
    { name: "Quiz Builder", badge: "Education" },
    { name: "Social Post Agent", badge: "Social" },
    { name: "Custom Agent", badge: "Advanced" },
  ];

  const features = [
    "Recommended prompts with ratings",
    "Project badges per app", 
    "Portfolio exports"
  ];

  return (
    <AnimatedSection id="app-studio" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Practice Makes Perfect—
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              On Live Apps
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Build real projects that earn you badges and portfolio pieces
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* App Studio Showcase */}
          <div>
            <Card className="overflow-hidden hover-elevate mb-6">
              <CardContent className="p-0">
                <img 
                  src={appStudioImage} 
                  alt="App Studio Projects" 
                  className="w-full h-auto"
                />
              </CardContent>
            </Card>

            {/* Video Placeholder */}
            <Card className="bg-black text-white">
              <CardContent className="p-8">
                <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <PlayCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold">Build Your First Project</h3>
                    <p className="text-sm text-gray-400">Duration: 0:45</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Apps Grid */}
          <div>
            {/* Featured App */}
            <Card className="mb-8 border-2 border-gradient-from hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gradient-to-r from-gradient-from to-gradient-to text-white p-2 rounded-lg">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Spiral the Study Buddy</h3>
                      <p className="text-gray-600">Our flagship application</p>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-gradient-from to-gradient-to text-white">
                    Flagship
                  </Badge>
                </div>
                <p className="text-gray-700 mb-4">
                  Build an AI-powered study companion that helps students learn more effectively
                </p>
                <Button 
                  variant="outline" 
                  className="border-gradient-from text-gradient-from hover:bg-gradient-from hover:text-white"
                  data-testid="button-try-spiral"
                >
                  Try Spiral
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Other Apps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.slice(1).map((app, index) => (
                <Card key={index} className="hover-elevate cursor-pointer" data-testid={`app-card-${app.name.toLowerCase().replace(/\s+/g, '-')}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{app.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {app.badge}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Build & Practice</span>
                      <Award className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover-elevate">
              <CardContent className="p-6">
                <div className="text-green-500 mb-3 flex justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <p className="font-medium">{feature}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-gradient-from to-gradient-to px-8 py-3 text-lg"
            data-testid="button-start-building"
          >
            Start Building
            <Star className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}