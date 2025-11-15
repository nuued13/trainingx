import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, X, Clock, Zap } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

export default function ComparisonTable() {
  const features = [
    { 
      feature: "Track Record", 
      trainingX: { value: "10 years", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      coursera: { value: "2-3 py", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
      udemy: { value: "1-2 yrs", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
      others: { value: "New", icon: <X className="h-5 w-5 text-red-500" /> }
    },
    {
      feature: "Content Updates",
      trainingX: { value: "Daily fresh", icon: <Zap className="h-5 w-5 text-green-500" /> },
      coursera: { value: "Static", icon: <X className="h-5 w-5 text-red-500" /> },
      udemy: { value: "Static", icon: <X className="h-5 w-5 text-red-500" /> },
      others: { value: "Rare", icon: <X className="h-5 w-5 text-red-500" /> }
    },
    {
      feature: "Practice Mode",
      trainingX: { value: "Gamified + live apps", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      coursera: { value: "Quizzes", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
      udemy: { value: "Quizzes", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
      others: { value: "Limited", icon: <X className="h-5 w-5 text-red-500" /> }
    },
    {
      feature: "Career Matching",
      trainingX: { value: "Yes (950+ opps)", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      coursera: { value: "Job board links", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
      udemy: { value: "None", icon: <X className="h-5 w-5 text-red-500" /> },
      others: { value: "None", icon: <X className="h-5 w-5 text-red-500" /> }
    },
    {
      feature: "Skill Tracking",
      trainingX: { value: "Big Five + 18", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      coursera: { value: "Completion only", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
      udemy: { value: "Completion only", icon: <Clock className="h-5 w-5 text-yellow-500" /> },
      others: { value: "Limited", icon: <X className="h-5 w-5 text-red-500" /> }
    },
    {
      feature: "Evolution",
      trainingX: { value: "Reactive parallelism", icon: <CheckCircle className="h-5 w-5 text-green-500" /> },
      coursera: { value: "Manual", icon: <X className="h-5 w-5 text-red-500" /> },
      udemy: { value: "Manual", icon: <X className="h-5 w-5 text-red-500" /> },
      others: { value: "Manual", icon: <X className="h-5 w-5 text-red-500" /> }
    }
  ];

  const platforms = [
    { name: "TrainingX.ai", key: "trainingX", highlight: true },
    { name: "Coursera", key: "coursera" },
    { name: "Udemy", key: "udemy" },
    { name: "Others", key: "others" }
  ];

  return (
    <AnimatedSection className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            What Makes Us{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Different
            </span>
          </h2>
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="grid grid-cols-5 bg-gray-50 border-b">
                <div className="p-4 font-semibold">Feature</div>
                {platforms.map((platform) => (
                  <div 
                    key={platform.key} 
                    className={`p-4 text-center font-semibold ${
                      platform.highlight ? 'bg-gradient-to-r from-gradient-from to-gradient-to text-white' : ''
                    }`}
                  >
                    {platform.name}
                  </div>
                ))}
              </div>

              {/* Rows */}
              {features.map((row, index) => (
                <div key={index} className="grid grid-cols-5 border-b hover:bg-gray-50 transition-colors">
                  <div className="p-4 font-medium">{row.feature}</div>
                  {platforms.map((platform) => {
                    const data = row[platform.key as keyof typeof row] as { value: string; icon: React.ReactNode };
                    return (
                      <div 
                        key={platform.key} 
                        className={`p-4 text-center ${
                          platform.highlight ? 'bg-gradient-to-r from-gradient-from/5 to-gradient-to/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {data.icon}
                          <span className="text-sm">{data.value}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Edge Statement */}
        <div className="text-center max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-gradient-from/5 to-gradient-to/5 border-gradient-from/20">
            <CardContent className="p-8">
              <p className="text-xl font-semibold text-gray-800">
                <strong>Our edge:</strong> Up-to date professional content + 10-year history + universal career outcomes.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AnimatedSection>
  );
}