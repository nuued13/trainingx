"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Trash2 } from "lucide-react";

export default function SeedPage() {
  const seedProjects = useMutation(api.seed.seedVibecoding);
  const deleteProject = useMutation(api.projects.deleteProject);
  const projects = useQuery(api.projects.getProjects, {});

  const [status, setStatus] = useState("Idle");

  const executeSeed = async () => {
    setStatus("Seeding...");
    try {
      const result = await seedProjects();
      setStatus("Success: " + result);
    } catch (e: any) {
      setStatus("Error: " + e.message);
    }
  };

  const handleSeed = () => {
    setStatus("Confirming...");
  };

  const handleDelete = async (id: any, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteProject({ id });
      // UI updates automatically via reactivity
    } catch (e: any) {
      alert("Failed to delete: " + e.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Project Manager</h1>
          <div className="text-right">
            <p className="text-slate-500 text-sm mb-2">
              Total Projects: {projects?.length || 0}
            </p>
          </div>
        </div>

        {/* Status Box */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center">
            <span className="font-mono text-sm text-slate-600">
              Status: {status}
            </span>
            {status === "Confirming..." ? (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
                <button
                  onClick={() => setStatus("Idle")}
                  className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={executeSeed}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold text-sm shadow-md transition-all hover:scale-105"
                >
                  🔥 YES, NUKE EVERYTHING
                </button>
              </div>
            ) : (
              <button
                onClick={() => setStatus("Confirming...")}
                className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 font-bold text-sm transition-colors"
              >
                ⚠️ NUKE & RESET DEFAULT PROJECTS
              </button>
            )}
          </div>
        </div>

        {/* Project List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {!projects ? (
            <div className="p-8 text-center text-slate-400">
              Loading projects...
            </div>
          ) : projects.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              Database is empty.
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {projects.map((project) => (
                <li
                  key={project._id}
                  className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group"
                >
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {project.title}
                    </h3>
                    <div className="flex gap-2 text-xs text-slate-500 mt-1">
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                        {project.category}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded-full">
                        {project.difficulty}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(project._id, project.title)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                    title="Delete Project"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
