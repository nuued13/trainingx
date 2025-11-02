"use client";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadState } from "@/lib/storage";
import { UserState } from "@shared/schema";
import certificateRules from "@/data/certificate-rules.json";
import { Download, Share2, Award, Lock, CheckCircle } from "lucide-react";

export default function Certificate() {
  const [userState, setUserState] = useState<UserState | null>(null);

  useEffect(() => {
    const state = loadState();
    setUserState(state);
  }, []);

  if (!userState) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p>Loading...</p>
    </div>;
  }

  const meetsRequirements = (cert: typeof certificateRules[0]) => {
    if (cert.requiredPS && userState.promptScore < cert.requiredPS) return false;
    if (cert.requiredProjects && userState.completedProjects.length < cert.requiredProjects) return false;
    if (cert.requiredAssessment && !userState.assessmentComplete) return false;
    return true;
  };

  const earnedCertificates = certificateRules.filter(cert => meetsRequirements(cert));
  const lockedCertificates = certificateRules.filter(cert => !meetsRequirements(cert));

  const getProgress = (cert: typeof certificateRules[0]) => {
    const checks = [];
    
    if (cert.requiredPS) {
      checks.push({
        label: `Prompt Score ${cert.requiredPS}+`,
        met: userState.promptScore >= cert.requiredPS,
        current: userState.promptScore,
        required: cert.requiredPS
      });
    }
    
    if (cert.requiredProjects) {
      checks.push({
        label: `${cert.requiredProjects}+ Projects`,
        met: userState.completedProjects.length >= cert.requiredProjects,
        current: userState.completedProjects.length,
        required: cert.requiredProjects
      });
    }
    
    if (cert.requiredAssessment) {
      checks.push({
        label: 'Full Assessment',
        met: userState.assessmentComplete,
        current: userState.assessmentComplete ? 1 : 0,
        required: 1
      });
    }
    
    return checks;
  };

  const renderCertificate = (cert: typeof certificateRules[0], isEarned: boolean) => {
    const progress = getProgress(cert);
    const completedChecks = progress.filter(p => p.met).length;
    const totalChecks = progress.length;

    return (
      <Card key={cert.id} className={isEarned ? "border-l-4 border-l-green-500" : ""}>
        <CardContent className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Award className={`h-8 w-8 ${isEarned ? 'text-yellow-500' : 'text-gray-400'}`} />
                <h2 className="text-2xl font-bold">{cert.name}</h2>
              </div>
              <p className="text-gray-600">{cert.description}</p>
            </div>
            {isEarned && (
              <CheckCircle className="h-8 w-8 text-green-500" />
            )}
          </div>

          {/* Progress Checks */}
          <div className="space-y-3 mb-6">
            {progress.map((check, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {check.met ? (
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={check.met ? 'text-green-700 font-medium' : 'text-gray-600'}>
                      {check.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      {check.current}/{check.required}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isEarned ? (
            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-to-r from-gradient-from to-gradient-to" data-testid={`button-download-${cert.id}`}>
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
              <Button variant="outline" data-testid={`button-share-${cert.id}`}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {completedChecks}/{totalChecks} requirements met
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Certificates</h1>
          <p className="text-gray-600">
            {earnedCertificates.length} of {certificateRules.length} certificates earned
          </p>
        </div>

        {/* Earned Certificates */}
        {earnedCertificates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Earned Certificates</h2>
            <div className="space-y-6">
              {earnedCertificates.map(cert => renderCertificate(cert, true))}
            </div>
          </div>
        )}

        {/* Locked Certificates */}
        {lockedCertificates.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Available Certificates</h2>
            <div className="space-y-6">
              {lockedCertificates.map(cert => renderCertificate(cert, false))}
            </div>
          </div>
        )}

        {earnedCertificates.length === 0 && lockedCertificates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Award className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2">No Certificates Available</h3>
              <p className="text-gray-600">Complete projects and assessments to earn certificates</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
