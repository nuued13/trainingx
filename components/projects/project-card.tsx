"use client";

import { motion } from "framer-motion";
import { ArrowRight, Flame, Trophy, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { JuicyButton } from "@/components/ui/juicy-button";
import { cn } from "@/lib/utils";
import { Doc } from "@/convex/_generated/dataModel";

interface ProjectCardProps {
  project: Doc<"projects">;
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Fallbacks for missing schema fields due to sync issues
  const difficultyMap: Record<string, number> = {
    Beginner: 1,
    Intermediate: 3,
    Advanced: 5,
  };
  const xpMap: Record<string, number> = {
    Beginner: 100,
    Intermediate: 300,
    Advanced: 500,
  };

  const difficultyLevel =
    (project as any).difficultyLevel || difficultyMap[project.difficulty] || 1;
  const xpReward = (project as any).xpReward || xpMap[project.difficulty] || 100;
  // Use _id as slug if slug is missing (legacy schema)
  const slug = (project as any).slug || project._id;

  // Deterministic image placeholder based on category
  const defaultImage =
    project.category === "AI"
      ? "/images/projects/voice-agent.webp"
      : project.category === "Game"
        ? "/images/projects/space-shooter.webp"
        : "/images/projects/dentist.webp";

  const imageUrl = (project as any).imageUrl || defaultImage;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-b-[6px] border-slate-200 bg-white transition-all hover:border-blue-300"
    >
      {/* Content Section */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4 flex items-start justify-between">
          <Badge className="bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 px-3 py-1 text-xs font-extrabold shadow-none">
            {project.category}
          </Badge>
          <div className="flex items-center gap-2">
            {(project as any).isCompleted && (
              <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                <CheckCircle2 className="h-3 w-3" />
                <span>Done</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
              <Trophy className="h-3 w-3 fill-yellow-500" />
              <span>{xpReward} XP</span>
            </div>
          </div>
        </div>

        <h3 className="mb-3 text-2xl font-extrabold text-slate-800 tracking-tight group-hover:text-blue-500 transition-colors">
          {project.title}
        </h3>

        <div className="mb-4 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Flame
              key={i}
              className={cn(
                "h-4 w-4",
                i <= difficultyLevel
                  ? "fill-orange-500 text-orange-500"
                  : "text-slate-200"
              )}
            />
          ))}
        </div>

        <p className="line-clamp-3 text-sm text-slate-500 font-medium mb-6 leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags?.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 uppercase tracking-wider"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          {/* Using _id because backend getProject requires projectId */}
          <Link href={`/projects/${project._id}`} className="w-full">
            <JuicyButton variant="primary" className="w-full gap-2 text-base">
              Start Build <ArrowRight className="h-5 w-5" />
            </JuicyButton>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
