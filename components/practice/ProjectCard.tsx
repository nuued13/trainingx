import Link from "next/link";
import { ArrowRight, Clock, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import badgeRules from "@/data/badge-rules.json";
import type { PracticeProject, UserStats } from "./types";

type ProjectCardProps = {
  project: PracticeProject;
  unlocked: boolean;
  completed: boolean;
  stats: UserStats;
  isLevelUnlocked: (level: number) => boolean;
};

export function ProjectCard({
  project,
  unlocked,
  completed,
  stats,
  isLevelUnlocked,
}: ProjectCardProps) {
  const getUnlockMessage = () => {
    if (
      project.requiresPromptScore !== undefined &&
      stats.promptScore < project.requiresPromptScore
    ) {
      return `Unlock at: ${project.requiresPromptScore} Prompt Score`;
    }
    if (!isLevelUnlocked(project.level)) {
      return `Complete all Level ${project.level - 1} challenges to unlock`;
    }
    if (project.requiresCompletion && project.requiresCompletion.length > 0) {
      return `Complete required challenges to unlock`;
    }
    return "Locked";
  };

  return (
    <Card
      className={`flex flex-col justify-between border-2 transition-all duration-300 ${
        completed 
          ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-400/50" 
          : unlocked
          ? "bg-gradient-to-br from-slate-800/60 to-purple-900/40 border-purple-400/50 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/30"
          : "opacity-50 bg-slate-800/40 border-slate-600/50"
      }`}
    >
      {!unlocked && (
        <div className="border-b-2 border-amber-400 bg-gradient-to-r from-amber-600/30 to-amber-700/20 p-4 rounded-t-xl">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-amber-300" />
            <span className="font-semibold text-amber-200">
              {project.badgeReward
                ? badgeRules[project.badgeReward as keyof typeof badgeRules]
                    ?.name
                : "Achievement"}
            </span>
          </div>
          <p className="text-xs text-amber-100/70">{getUnlockMessage()}</p>
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg leading-5 mb-2 text-white">
          {project.title}
          {completed && <span className="text-xs ml-2 text-green-300">✓</span>}
        </CardTitle>
        <CardDescription className="text-slate-300">{project.description}</CardDescription>
        <div className="flex items-center gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{project.duration}</span>
          </div>
          <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">
            {project.isAssessment
              ? "Assessment"
              : `${project.steps || 3} steps`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 text-sm justify-end">
        <div>
          <p className="font-semibold text-slate-300 mb-2">Builds Skills:</p>
          <div className="flex flex-wrap gap-1">
            {project.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="text-xs bg-slate-700/60 text-slate-200 border-slate-600">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
        {project.badgeReward && unlocked && (
          <div className="rounded-md border border-amber-400/50 bg-gradient-to-r from-amber-500/20 to-amber-600/10 p-3 text-xs text-amber-200">
            🏆 Earn badge:{" "}
            {
              badgeRules[project.badgeReward as keyof typeof badgeRules]?.name
            }
          </div>
        )}
        <div className="pt-1">
          {completed ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="flex-1 border-slate-500 text-slate-300">
                <Link href={`/practice/${project.slug}/result`}>
                  <Trophy className="h-4 w-4 mr-1" />
                  View Result
                </Link>
              </Button>
              <Button
                asChild
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
              >
                <Link href={project.actionLink || `#`}>
                  Retake
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          ) : unlocked ? (
            <Button
              asChild
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-cyan-600/50"
            >
              <Link href={project.actionLink || `#`}>
                ✨ Start Challenge <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          ) : (
            <Button disabled className="w-full border-slate-600" variant="outline">
              🔒 Locked
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
