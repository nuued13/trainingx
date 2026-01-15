"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { JuicyButton } from "@/components/ui/juicy-button";
import { ArrowLeft, CheckCircle2, Trophy, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SidebarLayout } from "@/components/layout/SidebarLayout";

export default function ProjectDetailPage() {
  const params = useParams();
  // Using slug as ID because of legacy schema limitations
  const projectId = params.slug as Id<"projects">;

  const project = useQuery(api.projects.getProject, { projectId: projectId });
  const toggleCompletion = useMutation(api.projects.toggleProjectCompletion);

  if (project === undefined) {
    return (
      <SidebarLayout>
        <div className="flex h-screen items-center justify-center text-slate-400 font-bold">
          Loading Project...
        </div>
      </SidebarLayout>
    );
  }

  if (project === null) {
    return (
      <SidebarLayout>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-6 text-center">
          <div className="text-8xl">🤔</div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2">
              Project Not Found
            </h1>
            <p className="text-slate-500 mb-8">
              This level might be locked or doesn't exist.
            </p>
            <Link href="/projects">
              <JuicyButton>Back to Arcade</JuicyButton>
            </Link>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Workaround for missing fields
  const difficultyLevel = project.difficultyLevel || 1;
  const xpReward = project.xpReward || 100;
  // Deterministic image placeholder based on category
  const defaultImage =
    project.category === "AI"
      ? "/images/projects/voice-agent.webp"
      : project.category === "Game"
        ? "/images/projects/space-shooter.webp"
        : "/images/projects/dentist.webp";
  const imageUrl = project.imageUrl || defaultImage;

  return (
    <SidebarLayout>
      <div className="bg-slate-50/50 min-h-full pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Back Link */}
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-bold text-slate-400 hover:text-slate-600 transition-colors mb-8"
          >
            <ArrowLeft className="h-5 w-5 stroke-[3]" /> Back to Arcade
          </Link>

          <div className="space-y-6">
            {/* Header Info */}
            <div className="text-center md:text-left">
              <div className="flex flex-wrap gap-3 mb-4 justify-center md:justify-start">
                <Badge className="bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 px-3 py-1 text-sm font-extrabold shadow-none">
                  {project.category}
                </Badge>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 px-3 py-1 text-sm font-extrabold shadow-none flex items-center gap-1">
                  <Trophy className="w-3 h-3 fill-yellow-700" /> {xpReward} XP
                </Badge>
                <Badge className="bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 px-3 py-1 text-sm font-extrabold shadow-none flex items-center gap-1">
                  <Clock className="w-3 h-3 stroke-[3]" />{" "}
                  {project.estimatedHours} Hours
                </Badge>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2 leading-tight">
                {project.title}
              </h1>
              <p className="text-xl text-slate-600 font-medium  max-w-3xl">
                {project.description}
              </p>
            </div>

            {/* Starter Prompt Section */}
            {project.starterPrompt && (
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-5 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                  <span className="text-xl">⚡️</span> Starter Prompt
                </h3>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 font-mono text-sm md:text-base text-slate-600 leading-relaxed mb-4">
                  "{project.starterPrompt}"
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-wide">
                  <span>💡 Tip:</span>
                  <span className="text-slate-400 font-medium normal-case tracking-normal">
                    Copy this into AI Studio to kickstart your project.
                  </span>
                </div>
              </div>
            )}

            {/* Requirements & Learning */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              {/* Requirements */}
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 text-base">
                    📋
                  </span>
                  Requirements
                </h3>
                <ul className="space-y-4">
                  {project.requirements?.map((r, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 bg-white p-4 rounded-xl border-2 border-slate-100 text-slate-600 font-medium"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Learning Objectives */}
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-pink-100 text-pink-600 text-base">
                    🧠
                  </span>
                  What you'll learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.learningObjectives?.map((l, i) => (
                    <span
                      key={i}
                      className="bg-pink-50 text-pink-700 font-bold px-4 py-3 rounded-xl border-2 border-pink-100"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Action Area */}
            <div className="pt-6 border-t-2 border-slate-200 mx-auto flex items-center gap-4">
              <div className="max-w-4xl mx-auto flex flex-col gap-4 w-full">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="https://aistudio.google.com/"
                    target="_blank"
                    className="flex-1 transform hover:scale-[1.02] transition-transform duration-200"
                  >
                    <JuicyButton
                      variant="primary"
                      size="lg"
                      className="w-full text-lg sm:text-xl py-4 px-8 shadow-xl shadow-blue-200/50 hover:shadow-blue-300 decoration-none h-auto whitespace-normal leading-tight"
                    >
                      <span className="text-lg">Build in Google AI Studio</span>
                    </JuicyButton>
                  </Link>

                  <JuicyButton
                    onClick={() => toggleCompletion({ projectId: project._id })}
                    variant={
                      (project as any).isCompleted ? "secondary" : "default"
                    }
                    size="lg"
                    disabled={(project as any).isCompleted}
                    className={`flex-1 text-lg sm:text-xl py-4 px-8 decoration-none h-auto whitespace-normal leading-tight ${
                      (project as any).isCompleted
                        ? "bg-green-200 text-green-700 hover:bg-green-200 border-green-300"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {(project as any).isCompleted ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 fill-green-600 text-white" />{" "}
                        Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6" /> Mark Complete
                      </span>
                    )}
                  </JuicyButton>
                </div>

                <p className="text-sm text-center text-slate-400 font-medium mx-auto">
                  Ready to code? Open Gemini and paste the starter prompt!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}
