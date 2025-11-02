import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLiveMatchPreview } from "@/lib/live-matching";
import { SkillSignals } from "@/lib/scoring";
import { Sparkles, TrendingUp, Lock, ArrowUp } from "lucide-react";

interface LiveMatchPreviewProps {
  currentPS: number;
  currentSkills: SkillSignals;
  completedProjects: number;
  completedProjectSlugs: string[];
  previousPS?: number;
  previousSkills?: SkillSignals;
}

export default function LiveMatchPreview({ 
  currentPS, 
  currentSkills, 
  completedProjects,
  completedProjectSlugs,
  previousPS,
  previousSkills
}: LiveMatchPreviewProps) {
  const matchStatus = getLiveMatchPreview(currentPS, currentSkills, completedProjects, completedProjectSlugs, previousPS, previousSkills);

  if (matchStatus.newlyUnlocked.length > 0) {
    return (
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-green-500 rounded-full p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-green-800 mb-2">🎉 New Match Unlocked!</h3>
              {matchStatus.newlyUnlocked.map((match, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-semibold text-green-700">{match.title}</div>
                  <div className="text-sm text-green-600 capitalize">{match.type} • {match.reason}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matchStatus.almostUnlocked.length > 0) {
    const next = matchStatus.almostUnlocked[0];
    
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-500 rounded-full p-2">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-blue-800">Almost There!</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {next.missingPoints} pts away
                </Badge>
              </div>
              <div className="font-semibold text-blue-700 mb-1">{next.match.title}</div>
              <div className="text-sm text-blue-600 capitalize mb-2">
                {next.match.type} opportunity
              </div>
              {next.missingSkills.length > 0 && (
                <div className="text-sm text-blue-600">
                  <span className="font-medium">Skills needed:</span>{' '}
                  {next.missingSkills.map(s => s.replace(/_/g, ' ')).join(', ')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (matchStatus.unlocked.length > 0) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="bg-purple-500 rounded-full p-2">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-800 mb-2">You have {matchStatus.unlocked.length} unlocked matches!</h3>
              <div className="text-sm text-purple-600">
                Keep practicing to unlock more opportunities
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="bg-gray-400 rounded-full p-2">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-1">Keep Building!</h3>
            <div className="text-sm text-gray-600">
              Improve your prompt score to unlock career opportunities
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
