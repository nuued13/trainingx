import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, BarChart3, TrendingUp, Eye, Download, Share2 } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import AnimatedCard from "./AnimatedCard";

export default function AnalyticsCertificates() {
  const [selectedSkill, setSelectedSkill] = useState("Logic");
  
  const skills = [
    { name: "Logic", score: 85, trend: "+12%" },
    { name: "Critical Thinking", score: 78, trend: "+8%" },
    { name: "Clarity", score: 92, trend: "+15%" },
    { name: "Creativity", score: 76, trend: "+5%" },
    { name: "Conversation Design", score: 88, trend: "+10%" }
  ];

  const certificates = [
    { title: "AI Prompting Fundamentals", level: "Beginner", issued: "Dec 2024", code: "TX-AF-2024-001" },
    { title: "Advanced Prompt Engineering", level: "Intermediate", issued: "Jan 2025", code: "TX-APE-2025-002" },
    { title: "AI Business Applications", level: "Advanced", issued: "Feb 2025", code: "TX-ABA-2025-003" }
  ];

  return (
    <AnimatedSection className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Analytics &{" "}
            <span className="bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent">
              Certificates
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Track Big Five + 18 skills in real time. Earn badges + certificates verifiable by code.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Real-time Analytics */}
          <div>
            <Card className="mb-6 hover-elevate">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <BarChart3 className="h-8 w-8 text-gradient-from mr-3" />
                  <h3 className="text-2xl font-bold">Real-time Skill Tracking</h3>
                </div>
                
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border cursor-pointer transition-all hover-elevate ${
                        selectedSkill === skill.name ? 'border-primary bg-primary/5' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedSkill(skill.name)}
                      data-testid={`skill-tracker-${skill.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{skill.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">{skill.score}%</span>
                          <Badge 
                            variant="secondary" 
                            className={skill.trend.includes('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            {skill.trend}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-gradient-from to-gradient-to h-2 rounded-full transition-all duration-300"
                          style={{ width: `${skill.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-gradient-from/5 to-gradient-to/5 border-gradient-from/20">
              <CardContent className="p-6">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-gradient-from mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">
                    Track 23 total skills across 5 core competencies with detailed progress analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Certificates */}
          <div>
            <Card className="hover-elevate">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Award className="h-8 w-8 text-gradient-from mr-3" />
                  <h3 className="text-2xl font-bold">Your Certificates</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  {certificates.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover-elevate">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{cert.title}</h4>
                          <p className="text-gray-600">Issued: {cert.issued}</p>
                        </div>
                        <Badge 
                          variant="secondary"
                          className={
                            cert.level === "Beginner" ? "bg-green-100 text-green-700" :
                            cert.level === "Intermediate" ? "bg-yellow-100 text-yellow-700" :
                            "bg-purple-100 text-purple-700"
                          }
                        >
                          {cert.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-mono">
                          Code: {cert.code}
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" data-testid={`button-download-${index}`}>
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" data-testid={`button-share-${index}`}>
                            <Share2 className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sample Certificate Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-full bg-gradient-to-r from-gradient-from to-gradient-to"
                      data-testid="button-view-sample-certificate"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      See Sample Certificate
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Sample Certificate</DialogTitle>
                    </DialogHeader>
                    <div className="border-2 border-gradient-from/20 rounded-lg p-8 bg-gradient-to-br from-white to-gray-50">
                      <div className="text-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-gradient-from to-gradient-to bg-clip-text text-transparent mb-4">
                          TrainingX.Ai
                        </div>
                        <h3 className="text-2xl font-bold mb-6">Certificate of Completion</h3>
                        <p className="text-lg mb-4">This is to certify that</p>
                        <p className="text-2xl font-bold mb-4">[Your Name]</p>
                        <p className="text-lg mb-4">has successfully completed</p>
                        <p className="text-xl font-semibold mb-6">AI Prompting Fundamentals</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                          <div>Issue Date: December 15, 2024</div>
                          <div>Certificate ID: TX-AF-2024-001</div>
                          <div>Skills Verified: 5 Core + 8 Supporting</div>
                          <div>Verification: trainingx.ai/verify</div>
                        </div>
                        
                        <div className="border-t pt-4">
                          <p className="text-xs text-gray-500">
                            This certificate is blockchain-verified and can be authenticated at trainingx.ai/verify
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}