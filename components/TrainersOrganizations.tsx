import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, BarChart3, Video, Calendar } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function TrainersOrganizations() {
  const benefits = [
    "Complete curriculum (5-week, 2-hour, self-paced)",
    "Admin dashboard with analytics + certificates", 
    "Instructor video library + marketing templates",
    "Pricing intelligence panel for ROI proof"
  ];

  const tiers = [
    { 
      name: "Starter", 
      price: "$99/mo", 
      color: "from-blue-500 to-blue-600",
      features: ["Basic curriculum", "Up to 50 students", "Email support"]
    },
    { 
      name: "Professional", 
      price: "$299/mo", 
      color: "from-purple-500 to-purple-600", 
      popular: true,
      features: ["Full curriculum", "Up to 500 students", "Priority support", "Analytics dashboard"]
    },
    { 
      name: "Enterprise", 
      price: "$599/mo", 
      color: "from-green-500 to-green-600",
      features: ["Custom curriculum", "Unlimited students", "White-label option", "Dedicated support"]
    }
  ];

  return (
    <AnimatedSection id="trainers" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            For Trainers &{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Organizations
            </span>
          </h2>
          <p className="text-2xl text-gray-700 mb-4 font-semibold">
            Turn AI Literacy Into Revenue
          </p>
          <p className="text-lg text-gray-600">
            Organizations pay $5K–$15K per workshop. You can earn six figures licensing TrainingX.Ai.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => (
            <Card key={index} className="text-center hover-elevate">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-4" />
                <p className="font-medium text-gray-700">{benefit}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Revenue Opportunity */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="bg-gradient-to-r from-gradient-from/5 to-gradient-to/5 border-gradient-from/20">
            <CardContent className="p-8 text-center">
              <DollarSign className="h-16 w-16 text-green-500 mx-auto mb-6" />
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">$5K–$15K</div>
                  <p className="text-gray-600">Per workshop for organizations</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">6 Figures</div>
                  <p className="text-gray-600">Annual licensing potential</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="max-w-5xl mx-auto mb-12">
          <h3 className="text-2xl font-bold text-center mb-8">Licensing Tiers</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative hover-elevate ${tier.popular ? 'ring-2 ring-primary scale-105' : ''}`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gradient-from to-gradient-to text-white">
                    Most Popular
                  </Badge>
                )}
                <CardContent className="p-8 text-center">
                  <div className={`bg-gradient-to-r ${tier.color} text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">{tier.name}</h4>
                  <div className="text-3xl font-bold text-gray-800 mb-6">{tier.price}</div>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={tier.popular ? "bg-gradient-to-r from-gradient-from to-gradient-to w-full" : "w-full"}
                    variant={tier.popular ? "default" : "outline"}
                    data-testid={`button-select-${tier.name.toLowerCase()}`}
                  >
                    Select {tier.name}
                  </Button>
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
            data-testid="button-schedule-demo"
          >
            Schedule Demo
            <Calendar className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </AnimatedSection>
  );
}