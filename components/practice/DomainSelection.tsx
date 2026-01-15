"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  Star,
  Trophy,
  Plus,
  Trash2,
  Wand2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DomainSelectionProps {
  userId: Id<"users">;
  onSelectDomain: (domainId: Id<"practiceDomains">, slug: string) => void;
}

export function DomainSelection({
  userId,
  onSelectDomain,
}: DomainSelectionProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<Id<"practiceDomains"> | null>(
    null
  );

  const domains = useQuery(api.practiceDomains.listWithUnlockStatus, {
    userId,
  }) as any;

  const customDomains = useQuery(api.customDomains.listMyCustomDomains) as any;
  const deleteCustomDomain = useMutation(api.customDomains.deleteCustomDomain);

  const handleDelete = async (domainId: Id<"practiceDomains">) => {
    setDeletingId(domainId);
    try {
      await deleteCustomDomain({ domainId });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!domains) {
    return (
      <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 text-lg font-bold">
            Loading domains...
          </div>
        </div>
      </div>
    );
  }

  const starterDomain = domains.find((d: any) => d.isStarter);
  // Filter out user-generated domains from specialized list (they'll be shown separately)
  const specializedDomains = domains.filter(
    (d: any) => !d.isStarter && !d.isUserGenerated
  );
  // All domains are always unlocked
  const unlockedCount = specializedDomains.length;

  return (
    <div className="min-h-full bg-slate-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div id="onborda-practice-header" className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Practice Zone
            </h1>
            <p className="text-xl font-medium text-slate-500">
              Master AI prompting across every domain
            </p>
          </div>

          {/* Progress Indicator */}
          {/* <div className="max-w-md mx-auto">
            <div className="rounded-2xl border-2 border-b-4 border-slate-200 bg-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                  <Zap className="h-6 w-6 stroke-[3px]" />
                </div>
                <span className="font-bold text-slate-600">
                  Specialized Domains
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-black text-slate-700">
                  {unlockedCount}
                </span>
                <span className="text-xl font-bold text-slate-400">
                  / {specializedDomains.length}
                </span>
              </div>
            </div>
          </div> */}
        </motion.div>

        {/* Starter Domain */}
        {starterDomain && (
          <motion.div
            id="onborda-starter-domain"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
                <Star className="h-6 w-6 stroke-[3px]" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-700">
                Continue Learning
              </h2>
            </div>

            <motion.div
              whileHover={{ scale: 1.01, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className="bg-white border-2 border-b-[6px] border-slate-200 hover:border-blue-200 rounded-3xl transition-all cursor-pointer group overflow-hidden"
                onClick={() =>
                  onSelectDomain(starterDomain._id, starterDomain.slug)
                }
              >
                <CardContent className="px-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-4">
                        <motion.div
                          className="text-6xl p-4 bg-blue-50 rounded-3xl border-2 border-blue-100"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {starterDomain.icon}
                        </motion.div>
                        <div>
                          <h3 className="text-3xl font-extrabold text-slate-800 mb-2">
                            {starterDomain.title}
                          </h3>
                          <p className="text-lg text-slate-500 font-medium max-w-xl">
                            {starterDomain.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-6">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 border-slate-200 px-3 py-1 font-bold"
                        >
                          {starterDomain.trackCount} tracks
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-700 border-yellow-200 px-3 py-1 font-bold"
                        >
                          Essential for everyone
                        </Badge>
                      </div>
                    </div>

                    <div className="self-center">
                      <div
                        className="h-14 w-14 rounded-2xl bg-blue-500 flex items-center justify-center text-white
                          shadow-[0_4px_0_0_#2563eb] active:shadow-none active:translate-y-[4px] transition-all"
                      >
                        <ArrowRight className="w-8 h-8 stroke-[3px]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Specialized Domains */}
        <div id="onborda-specialized-domains" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                <Trophy className="h-6 w-6 stroke-[3px]" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-700">
                Specialized Domains
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <TooltipProvider>
              {/* {specializedDomains.map((domain: any, index: number) => (
                <motion.div
                  key={domain._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className="h-full transition-all border-2 border-b-[6px] rounded-3xl relative overflow-hidden bg-white border-slate-200 hover:border-purple-200 hover:shadow-lg cursor-pointer group"
                        onClick={() => onSelectDomain(domain._id, domain.slug)}
                      >
                        <CardContent className="px-6 py-6 font-medium flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <motion.span className="text-5xl p-3 rounded-2xl border-2 transition-colors bg-purple-50 border-purple-100 text-purple-600 group-hover:scale-110 duration-200">
                              {domain.icon}
                            </motion.span>
                          </div>

                          <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight">
                            {domain.title}
                          </h3>
                          <p className="text-sm mb-6 leading-relaxed font-semibold text-slate-500">
                            {domain.description}
                          </p>

                          <div className="flex items-center gap-2 mb-4">
                            <Badge
                              variant="secondary"
                              className="bg-slate-100 text-slate-600 border-slate-200 font-bold"
                            >
                              {domain.trackCount} tracks
                            </Badge>
                          </div>

                          <div className="mt-auto w-full">
                            <div className="w-full py-4 rounded-xl bg-blue-500 text-white font-extrabold text-center uppercase tracking-wide text-xs shadow-[0_4px_0_0_#2563eb] hover:bg-blue-600 active:shadow-none active:translate-y-[4px] transition-all">
                              Start Practice
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                  </Tooltip>
                </motion.div>
              ))} */}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ scale: 1.02, y: -4 }}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className="h-full border-2 rounded-3xl transition-all group bg-slate-50 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 cursor-pointer"
                      onClick={() => router.push("/practice/custom/create")}
                    >
                      <CardContent className="px-6 py-6 font-medium h-full flex flex-col items-center justify-center text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center transition-transform group-hover:scale-110">
                          <Plus className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-700">
                            Create Custom Domain
                          </h3>
                          <p className="text-slate-500 font-medium mt-2">
                            Build your own course
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                </Tooltip>
              </motion.div>
            </TooltipProvider>
          </div>
        </div>

        {customDomains && customDomains.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-500">
                  <Wand2 className="h-6 w-6 stroke-[3px]" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-700">
                  Your Custom Domains
                </h2>
              </div>
              <Badge
                variant="secondary"
                className="bg-indigo-100 text-indigo-700 border-indigo-200 font-bold px-3 py-1"
              >
                {customDomains.length} created
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {customDomains.map((domain: any, index: number) => (
                <motion.div
                  key={domain._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <Card className="h-full transition-all border-2 border-b-[6px] rounded-3xl relative overflow-hidden bg-white border-slate-200 hover:border-indigo-200 hover:shadow-lg group">
                    <CardContent className="px-6 py-6 font-medium">
                      <div className="flex items-start justify-between mb-4">
                        <motion.span
                          className="text-5xl p-3 rounded-2xl border-2 transition-colors bg-indigo-50 border-indigo-100 text-indigo-600"
                          whileHover={{ scale: 1.1 }}
                        >
                          {domain.icon}
                        </motion.span>

                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                              disabled={deletingId === domain._id}
                            >
                              {deletingId === domain._id ? (
                                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Custom Domain?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{domain.title}"
                                and all its tracks, levels, and practice items.
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(domain._id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>

                      <h3 className="text-2xl font-extrabold text-slate-800 mb-2 leading-tight">
                        {domain.title}
                      </h3>
                      <p className="text-sm mb-6 leading-relaxed font-semibold text-slate-500">
                        {domain.description}
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 border-slate-200 font-bold"
                        >
                          {domain.trackCount} tracks
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-indigo-100 text-indigo-700 border-indigo-200 font-bold"
                        >
                          Custom
                        </Badge>
                      </div>

                      <div
                        className="mt-auto cursor-pointer"
                        onClick={() => onSelectDomain(domain._id, domain.slug)}
                      >
                        <div
                          className="w-full py-3 rounded-xl bg-indigo-100/50 border-2 border-indigo-100 text-indigo-700 font-extrabold text-center uppercase tracking-wide text-xs
                            hover:bg-indigo-500 hover:border-indigo-500 hover:text-white transition-all shadow-sm"
                        >
                          Start Practice
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
