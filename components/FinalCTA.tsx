import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function FinalCTA() {
  return (
    <AnimatedSection className="py-20 bg-gradient-to-br from-gradient-from to-gradient-to text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-6xl font-bold mb-8">
            "With TrainingX.Ai you'll be able to handle any AI app on the market."
          </h2>
          
          <div className="text-xl md:text-2xl mb-12 space-x-2">
            <span className="font-semibold">Learn</span>
            <span className="text-white/80">→</span>
            <span className="font-semibold">Practice</span>
            <span className="text-white/80">→</span>
            <span className="font-semibold">Build</span>
            <span className="text-white/80">→</span>
            <span className="font-semibold">Align</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              size="lg"
              className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              data-testid="button-final-assessment"
            >
              Take Free Assessment
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button 
              size="lg"
             className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              data-testid="button-final-demo"
            >
              <Calendar className="mr-1 h-5 w-5" />
              Book Trainer Demo
            </Button>
          </div>

          {/* Stats Reminder */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { value: "10 Years", label: "Proven Track Record" },
              { value: "2.5B", label: "Daily AI Prompts" },
              { value: "950+", label: "Career Opportunities" },
              { value: "70%+", label: "Skill Improvement" }
            ].map((stat, index) => (
              <AnimatedCard key={index} index={index} delay={0.5}>
                <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
                <CardContent className="p-6">
                  <div className="text-2xl text-white font-bold mb-2">{stat.value}</div>
                  <div className="text-sm text-white/80">{stat.label}</div>
                </CardContent>
              </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}