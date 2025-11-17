"use client";

import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, ArrowRight, Sparkles, Zap } from "lucide-react";
import { Id } from "convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DomainSelectionProps {
  userId: Id<"users">;
  onSelectDomain: (domainId: Id<"practiceDomains">, slug: string) => void;
}

export function DomainSelection({ userId, onSelectDomain }: DomainSelectionProps) {
  const domains = useQuery(api.practiceDomains.listWithUnlockStatus, { userId }) as any;

  if (!domains) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading domains...</div>
      </div>
    );
  }

  const starterDomain = domains.find((d: any) => d.isStarter);
  const specializedDomains = domains.filter((d: any) => !d.isStarter);
  const hasUnlockedSpecialized = specializedDomains.some((d: any) => d.isUnlocked);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Practice Zone
          </h1>
          <p className="text-xl text-emerald-200/80 mb-6">
            Master AI prompting across every domain
          </p>
          
          {/* Progress Indicator */}
          <div className="inline-block bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-slate-300">
                <span className="text-emerald-300 font-semibold">{specializedDomains.filter((d: any) => d.isUnlocked).length}</span>
                {" "}of {specializedDomains.length} specialized domains unlocked
              </span>
            </div>
          </div>
        </motion.div>

        {/* Starter Domain */}
        {starterDomain && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">
                {hasUnlockedSpecialized ? "Continue Learning" : "Start Here"}
              </h2>
            </div>

            <motion.div
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Card
                className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/50 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer group"
                onClick={() => onSelectDomain(starterDomain._id, starterDomain.slug)}
              >
                <CardContent className="p-8">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <motion.span 
                          className="text-5xl"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {starterDomain.icon}
                        </motion.span>
                        <div>
                          <h3 className="text-2xl font-bold text-white">
                            {starterDomain.title}
                          </h3>
                          <p className="text-emerald-200">
                            {starterDomain.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant="secondary" className="bg-emerald-500/30 text-emerald-100">
                          {starterDomain.trackCount} tracks
                        </Badge>
                        <Badge variant="secondary" className="bg-teal-500/30 text-teal-100">
                          Essential for everyone
                        </Badge>
                      </div>
                    </div>

                    <motion.div
                      animate={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <ArrowRight className="w-6 h-6 text-emerald-300" />
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Specialized Domains */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {hasUnlockedSpecialized ? "Specialized Domains" : "Unlock Specialized Domains"}
            </h2>
            {!hasUnlockedSpecialized && (
              <Badge variant="outline" className="text-emerald-300 border-emerald-400">
                Complete Level 1 to unlock
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TooltipProvider>
              {specializedDomains.map((domain: any, index: number) => (
                <motion.div
                  key={domain._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  whileHover={domain.isUnlocked ? { scale: 1.02, y: -4 } : {}}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Card
                        className={cn(
                          "h-full transition-all",
                          domain.isUnlocked
                            ? "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer group"
                            : "bg-gradient-to-br from-slate-800/30 to-slate-900/30 border-slate-700/50 opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => domain.isUnlocked && onSelectDomain(domain._id, domain.slug)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <motion.span 
                              className="text-4xl"
                              whileHover={domain.isUnlocked ? { scale: 1.1 } : {}}
                            >
                              {domain.icon}
                            </motion.span>
                            {!domain.isUnlocked && (
                              <Lock className="w-5 h-5 text-slate-600" />
                            )}
                          </div>

                          <h3 className="text-xl font-bold text-white mb-2">
                            {domain.title}
                          </h3>
                          <p className={cn(
                            "text-sm mb-4",
                            domain.isUnlocked ? "text-slate-400" : "text-slate-500"
                          )}>
                            {domain.description}
                          </p>

                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-slate-700/50 text-slate-300 text-xs">
                              {domain.trackCount} tracks
                            </Badge>
                            {domain.isUnlocked && (
                              <Badge variant="secondary" className="bg-green-500/20 text-green-300 text-xs">
                                ✨ Unlocked
                              </Badge>
                            )}
                          </div>

                          {domain.isUnlocked && (
                            <motion.div 
                              className="mt-4 flex items-center text-emerald-300 text-sm"
                              whileHover={{ x: 4 }}
                            >
                              <span>Explore</span>
                              <ArrowRight className="w-4 h-4 ml-1" />
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </TooltipTrigger>
                    {!domain.isUnlocked && (
                      <TooltipContent className="bg-slate-800 border-slate-700 text-slate-200">
                        <p className="text-sm">Complete Level 1 to unlock</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </motion.div>
              ))}
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
