import { Lock } from "lucide-react";
import { LevelHeader } from "./LevelHeader";
import { ProjectCard } from "./ProjectCard";
import type { PracticeProject, UserStats, LevelProgress } from "./types";

type LevelSectionProps = {
  level: number;
  projects: PracticeProject[];
  levelUnlocked: boolean;
  progress: LevelProgress;
  completedSlugs: Set<string>;
  stats: UserStats;
  isLevelUnlocked: (level: number) => boolean;
  isProjectUnlocked: (project: PracticeProject) => boolean;
};

export function LevelSection({
  level,
  projects,
  levelUnlocked,
  progress,
  completedSlugs,
  stats,
  isLevelUnlocked,
  isProjectUnlocked,
}: LevelSectionProps) {
  return (
    <section className="space-y-4 bg-gradient-to-r from-slate-800/50 to-purple-800/50 rounded-2xl p-6 border border-purple-500/20 backdrop-blur">
      <LevelHeader
        level={level}
        levelUnlocked={levelUnlocked}
        progress={progress}
      />

      {!levelUnlocked && (
        <div className="bg-amber-500/20 border border-amber-400/50 rounded-lg p-4 flex items-center gap-3">
          <Lock className="h-5 w-5 text-amber-300 flex-shrink-0" />
          <p className="text-sm text-amber-100">
            Complete all Level {level - 1} challenges to unlock this level
          </p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => {
          const unlocked = isProjectUnlocked(project);
          const completed = completedSlugs.has(project.slug);

          return (
            <ProjectCard
              key={project.slug}
              project={project}
              unlocked={unlocked}
              completed={completed}
              stats={stats}
              isLevelUnlocked={isLevelUnlocked}
            />
          );
        })}
      </div>
    </section>
  );
}
