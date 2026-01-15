"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JuicyButton } from "@/components/ui/juicy-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Swords,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Users,
  Settings,
  Zap,
  Crown,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { Id } from "convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContextProvider";
import { DuelTopicSelection } from "./DuelTopicSelection";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createDuelRoom } from "@/app/actions/duels";

export function DuelArena() {
  const [selectedTab, setSelectedTab] = useState("active");
  const { user } = useAuth();

  // ... (keep queries)
  const userDuels = useQuery(
    api.duels.getUserDuels,
    user?._id ? { userId: user._id as any } : "skip"
  );
  const openDuels = useQuery(api.duels.getOpenDuels, { limit: 10 });
  const duelStats = useQuery(
    api.duels.getDuelStats,
    user?._id ? { userId: user._id as any } : "skip"
  );
  const acceptDuel = useMutation(api.duels.acceptDuel);

  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [dialogStep, setDialogStep] = useState<"topic" | "settings">("topic");
  const [selectedTopic, setSelectedTopic] = useState<{
    trackSlug: string;
    trackName: string;
  } | null>(null);
  const [duelParams, setDuelParams] = useState({
    itemCount: 5,
    difficulty: "intermediate",
  });

  const handleCreateDuel = async () => {
    if (!user?._id) return;
    setCreating(true);
    try {
      if (!selectedTopic?.trackSlug) {
        throw new Error("No track selected");
      }

      // Call Server Action
      const result = await createDuelRoom(
        user._id as string,
        selectedTopic.trackSlug,
        duelParams.itemCount,
        "intermediate"
      );

      if (!result.success || !result.roomId) {
        throw new Error(result.error || "Failed to create room");
      }

      setShowCreateDialog(false);
      setDialogStep("topic");
      setSelectedTopic(null);
      // Redirect to room lobby
      window.location.href = `/duels/${result.roomId}`;
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleTopicSelect = (trackSlug: string, trackName: string) => {
    setSelectedTopic({ trackSlug, trackName });
    setDialogStep("settings");
  };

  const handleDialogClose = (open: boolean) => {
    setShowCreateDialog(open);
    if (!open) {
      setDialogStep("topic");
      setSelectedTopic(null);
    }
  };

  const handleAcceptDuel = async (roomId: Id<"practiceDuels">) => {
    if (!user?._id) return;
    try {
      await acceptDuel({
        userId: user._id as any,
        roomId,
      });
      window.location.href = `/duels/${roomId}`;
    } catch (error) {
      console.error("Failed to join room:", error);
    }
  };

  // Show loading only if undefined
  if (duelStats === undefined) {
    return (
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // If null, user not authenticated
  if (duelStats === null) {
    return (
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 text-center">
        <p className="text-slate-600 font-bold">
          Please log in to access Duels
        </p>
      </div>
    );
  }

  const activeDuels = userDuels?.filter((d) => d.status === "active") || [];
  const completedDuels =
    userDuels?.filter((d) => d.status === "completed") || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border-2 border-b-[6px] border-red-200 bg-white text-red-500 shadow-sm">
            <Swords className="h-8 w-8 stroke-3" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">
              Duel Arena
            </h1>
            <p className="text-lg font-medium text-slate-500">
              Challenge others and prove your prompting skills
            </p>
          </div>
        </div>
        <JuicyButton
          onClick={() => setShowCreateDialog(true)}
          className="gap-2"
        >
          <Swords className="h-5 w-5 stroke-3" />
          Create Duel
        </JuicyButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wide">
              Total Duels
            </div>
            <Swords className="h-6 w-6 text-slate-300 stroke-3" />
          </div>
          <div className="text-4xl font-black text-slate-700">
            {duelStats.totalRooms}
          </div>
        </div>

        <div className="rounded-3xl border-2 border-b-[6px] border-green-200 bg-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-green-600 uppercase tracking-wide">
              Wins
            </div>
            <Trophy className="h-6 w-6 text-green-400 stroke-3" />
          </div>
          <div className="text-4xl font-black text-green-500">
            {duelStats.wins}
          </div>
        </div>

        <div className="rounded-3xl border-2 border-b-[6px] border-blue-200 bg-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-blue-600 uppercase tracking-wide">
              Win Rate
            </div>
            <TrendingUp className="h-6 w-6 text-blue-400 stroke-3" />
          </div>
          <div className="text-4xl font-black text-blue-500">
            {duelStats.winRate}%
          </div>
        </div>

        <div className="rounded-3xl border-2 border-b-[6px] border-orange-200 bg-white p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-orange-600 uppercase tracking-wide">
              Active
            </div>
            <Clock className="h-6 w-6 text-orange-400 stroke-3" />
          </div>
          <div className="text-4xl font-black text-orange-500">
            {duelStats.activeRooms}
          </div>
        </div>
      </div>

      {/* Duels Tabs */}
      <Tabs
        value={selectedTab}
        onValueChange={setSelectedTab}
        className="space-y-6"
      >
        <TabsList className="w-full h-auto p-1 bg-slate-100 rounded-2xl border-2 border-slate-200">
          <TabsTrigger
            value="active"
            className="flex-1 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm transition-all"
          >
            Active ({activeDuels.length})
          </TabsTrigger>
          <TabsTrigger
            value="open"
            className="flex-1 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm transition-all"
          >
            Open Challenges ({openDuels?.length || 0})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex-1 py-3 rounded-xl font-bold text-slate-500 data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=active]:shadow-sm transition-all"
          >
            Completed ({completedDuels.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeDuels.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Swords className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No active duels
              </h3>
              <p className="text-slate-500 font-medium mt-1 mb-6">
                Start a duel to challenge others!
              </p>
              <JuicyButton onClick={handleCreateDuel}>
                <Swords className="mr-2 h-5 w-5 stroke-3" />
                Create Your First Duel
              </JuicyButton>
            </div>
          ) : (
            activeDuels.map((duel) => (
              <div
                key={duel._id}
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-extrabold text-slate-800">
                      Duel #{duel._id.slice(-6)}
                    </h3>
                    <span className="rounded-lg bg-green-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-green-600">
                      Active
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-4">
                    {duel.itemIds.length} items · Started{" "}
                    {new Date(duel.startedAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Your Score
                      </div>
                      <div className="text-2xl font-black text-blue-500">
                        {duel.scores?.[user?._id as string] || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Players
                      </div>
                      <div className="text-2xl font-black text-slate-600">
                        {duel.participants?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <JuicyButton asChild className="h-12 px-6">
                  <Link href={`/duels/${duel._id}`}>Continue</Link>
                </JuicyButton>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="open" className="space-y-4">
          {!openDuels || openDuels.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No open challenges
              </h3>
              <p className="text-slate-500 font-medium mt-1">
                Check back later or create your own!
              </p>
            </div>
          ) : (
            openDuels.map((duel) => (
              <div
                key={duel._id}
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-extrabold text-slate-800">
                      Open Challenge #{duel._id.slice(-6)}
                    </h3>
                    <span className="rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-600">
                      Open
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-4">
                    {duel.itemIds.length} items · Created{" "}
                    {new Date(duel.startedAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-bold text-orange-500">
                    <Clock className="h-4 w-4 stroke-3" />
                    Expires in{" "}
                    {Math.ceil(
                      (duel.expiresAt - Date.now()) / (1000 * 60 * 60 * 24)
                    )}{" "}
                    days
                  </div>
                </div>
                <JuicyButton
                  onClick={() => handleAcceptDuel(duel._id)}
                  className="h-12 px-6"
                >
                  Accept Challenge
                </JuicyButton>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedDuels.length === 0 ? (
            <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Trophy className="h-8 w-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                No completed duels yet
              </h3>
              <p className="text-slate-500 font-medium mt-1">
                Complete a duel to see your history!
              </p>
            </div>
          ) : (
            completedDuels.map((duel) => (
              <div
                key={duel._id}
                className="group relative flex items-center justify-between overflow-hidden rounded-3xl border-2 border-b-[6px] border-slate-200 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-extrabold text-slate-800">
                      Duel #{duel._id.slice(-6)}
                    </h3>
                    <span
                      className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-wide ${
                        duel.rankings && duel.rankings.length > 0
                          ? "bg-purple-100 text-purple-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {duel.rankings && duel.rankings.length > 0
                        ? "Completed"
                        : "In Progress"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-slate-500 mb-4">
                    Completed{" "}
                    {new Date(duel.completedAt || 0).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Your Score
                      </div>
                      <div className="text-2xl font-black text-slate-700">
                        {duel.rankings?.find((r) => r.userId === user?._id)
                          ?.score ||
                          duel.scores?.[user?._id as string] ||
                          0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        Rank
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-700">
                          #
                          {duel.rankings?.find((r) => r.userId === user?._id)
                            ?.rank || "-"}
                        </span>
                        <span className="text-sm font-bold text-slate-400">
                          of {duel.participants?.length || 0}
                        </span>
                      </div>
                    </div>
                    {(() => {
                      const userRank = duel.rankings?.find(
                        (r) => r.userId === user?._id
                      )?.rank;
                      if (!userRank) return null;
                      const isWinner = userRank === 1;
                      return (
                        <div
                          className={`flex items-center gap-2 font-bold ${
                            isWinner ? "text-green-500" : "text-slate-500"
                          }`}
                        >
                          {isWinner ? (
                            <>
                              <Trophy className="h-5 w-5 stroke-3" />
                              Victory!
                            </>
                          ) : userRank <= 3 ? (
                            <>
                              <Target className="h-5 w-5 stroke-3" />
                              Top 3
                            </>
                          ) : null}
                        </div>
                      );
                    })()}
                  </div>
                </div>
                <JuicyButton asChild variant="secondary" className="h-12 px-6">
                  <Link href={`/duels/${duel._id}`}>View Details</Link>
                </JuicyButton>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Duel Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-2 border-slate-200">
          <DialogHeader className="p-6 pb-4 border-b-2 border-slate-100 bg-slate-50/50">
            <DialogTitle className="flex items-center gap-2 text-2xl font-extrabold text-slate-800">
              {dialogStep === "topic" ? (
                <>
                  <Swords className="h-6 w-6 stroke-3 text-red-400" />
                  Choose Topic
                </>
              ) : (
                <>
                  <button
                    onClick={() => setDialogStep("topic")}
                    className="p-1 -ml-1 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-slate-400" />
                  </button>
                  <Settings className="h-6 w-6 stroke-3 text-slate-400" />
                  Battle Settings
                </>
              )}
            </DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              {dialogStep === "topic"
                ? "Select a topic for your duel"
                : `Topic: ${selectedTopic?.trackName || "Random Mix"}`}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {dialogStep === "topic" && user?._id && (
              <DuelTopicSelection
                userId={user._id as any}
                onSelectTrack={handleTopicSelect}
                onCancel={() => setShowCreateDialog(false)}
              />
            )}

            {dialogStep === "settings" && (
              <div className="space-y-6">
                {/* Selected Topic Badge */}
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                  <Swords className="h-5 w-5 text-emerald-600" />
                  <span className="font-bold text-emerald-700">
                    {selectedTopic?.trackName || "Random Mix"}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="item-count"
                    className="text-xs font-bold text-slate-500 uppercase tracking-wide"
                  >
                    Number of Items
                  </Label>
                  <Select
                    value={duelParams.itemCount.toString()}
                    onValueChange={(value) =>
                      setDuelParams({
                        ...duelParams,
                        itemCount: parseInt(value),
                      })
                    }
                  >
                    <SelectTrigger
                      id="item-count"
                      className="h-12 rounded-xl border-2 border-slate-200 bg-slate-50 font-bold text-slate-700 focus:ring-0"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-2 border-slate-200 font-bold">
                      <SelectItem value="3">3 Items (Quick - 5 min)</SelectItem>
                      <SelectItem value="5">
                        5 Items (Standard - 10 min)
                      </SelectItem>
                      <SelectItem value="10">
                        10 Items (Marathon - 20 min)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs font-medium text-slate-400">
                    More items = longer duel but more accurate skill test
                  </p>
                </div>

                <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                  <p className="text-sm font-bold text-blue-700 leading-relaxed">
                    <span className="mr-2">💡</span>
                    Multi-Player: 2-10 players can join! Share the room link
                    after creating.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setDialogStep("topic")}
                    className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                  >
                    Back
                  </Button>
                  <JuicyButton
                    onClick={handleCreateDuel}
                    disabled={creating}
                    className="flex-1"
                  >
                    {creating ? "Creating..." : "Create Room"}
                  </JuicyButton>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
