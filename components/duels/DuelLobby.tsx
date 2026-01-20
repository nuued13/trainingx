"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContextProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Swords,
  Copy,
  Check,
  Loader2,
  Users,
  Clock,
  Zap,
  Crown,
  X,
  LogOut,
} from "lucide-react";

type DuelLobbyProps = {
  roomId: Id<"practiceDuels">;
  onStart: () => void;
};

export function DuelLobby({ roomId, onStart }: DuelLobbyProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const roomDetails = useQuery(api.duels.getRoomDetails, { roomId });
  const markReady = useMutation(api.duels.markReady);
  const leaveRoom = useMutation(api.duels.leaveRoom);
  const kickPlayer = useMutation(api.duels.kickPlayer);
  const forceStart = useMutation(api.duels.forceStart);

  const room = roomDetails?.room;
  const participants = roomDetails?.participants || [];

  const isHost = room?.hostId === user?._id;
  const isReady = room?.readyPlayers?.includes(user?._id as any) || false;
  const readyCount = room?.readyPlayers?.length || 0;
  const totalPlayers = room?.participants?.length || 0;
  const allReady =
    readyCount === totalPlayers && totalPlayers >= (room?.minPlayers || 2);

  // Handle countdown when all ready
  useEffect(() => {
    if (
      allReady &&
      countdown === null &&
      totalPlayers >= (room?.minPlayers || 2)
    ) {
      setCountdown(3);
    }
  }, [allReady, countdown, totalPlayers, room?.minPlayers]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onStart();
    }
  }, [countdown, onStart]);

  // Check if room started
  useEffect(() => {
    if (room?.status === "active") {
      onStart();
    }
  }, [room?.status, onStart]);

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/duels/${roomId}?invite=true`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleReady = async () => {
    if (!user?._id) return;
    try {
      await markReady({
        userId: user._id as any,
        roomId,
        ready: !isReady,
      });
    } catch (error) {
      console.error("Failed to toggle ready:", error);
    }
  };

  const handleLeave = async () => {
    if (!user?._id) return;
    try {
      await leaveRoom({
        userId: user._id as any,
        roomId,
      });
      window.location.href = "/duels";
    } catch (error) {
      console.error("Failed to leave room:", error);
    }
  };

  const handleKick = async (playerId: Id<"users">) => {
    if (!user?._id || !isHost) return;
    try {
      await kickPlayer({
        hostId: user._id as any,
        roomId,
        playerId,
      });
    } catch (error) {
      console.error("Failed to kick player:", error);
    }
  };

  const handleForceStart = async () => {
    if (!user?._id || !isHost) return;
    try {
      await forceStart({
        hostId: user._id as any,
        roomId,
      });
    } catch (error) {
      console.error("Failed to force start:", error);
      alert(error instanceof Error ? error.message : "Failed to start game");
    }
  };

  if (!room || !user) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading lobby...</p>
        </CardContent>
      </Card>
    );
  }

  // Countdown overlay
  if (countdown !== null && countdown >= 0) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <motion.div
          key={countdown}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {countdown > 0 ? (
            <>
              <div className="text-9xl font-bold text-white mb-4">
                {countdown}
              </div>
              <p className="text-2xl text-gray-300">Get Ready!</p>
            </>
          ) : (
            <>
              <Zap className="h-32 w-32 text-yellow-500 mx-auto mb-4" />
              <div className="text-6xl font-bold text-white">GO!</div>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // Determine layout based on player count
  const getLayout = () => {
    if (totalPlayers <= 2) return "split";
    if (totalPlayers <= 5) return "row";
    if (totalPlayers <= 10) return "grid";
    return "list";
  };

  const layout = getLayout();

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full"
      >
        <Card className="border-2 border-purple-500 shadow-2xl">
          <CardHeader className="text-center border-b border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLeave}
                className="text-red-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
              <div className="flex items-center gap-3">
                <Swords className="h-8 w-8 text-red-500" />
                <CardTitle className="text-3xl">Battle Lobby</CardTitle>
              </div>
              <div className="w-24" /> {/* Spacer */}
            </div>
            <CardDescription className="text-lg">
              {readyCount}/{totalPlayers} players ready · {room.minPlayers}{" "}
              minimum to start
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* Invite Link Section */}
            {totalPlayers < room.maxPlayers && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-6"
              >
                <Card className="bg-blue-50 border-2 border-blue-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-bold text-blue-900 text-sm mb-2">
                          Invite Friends ({totalPlayers}/{room.maxPlayers}{" "}
                          players)
                        </h3>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            value={`${window.location.origin}/duels/${roomId}?invite=true`}
                            className="flex-1 px-3 py-2 bg-white border border-blue-300 rounded-md text-sm"
                          />
                          <Button
                            onClick={handleCopyInvite}
                            variant={copied ? "default" : "outline"}
                            size="sm"
                            className="shrink-0"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Players Display */}
            <div className="mb-6">
              {layout === "split" && (
                <div className="grid grid-cols-2 gap-8">
                  {participants.map((participant, idx) => (
                    <PlayerCard
                      key={participant._id}
                      participant={participant}
                      isHost={participant._id === room.hostId}
                      isReady={room.readyPlayers.includes(participant._id)}
                      isYou={participant._id === user._id}
                      canKick={isHost && participant._id !== user._id}
                      onKick={() => handleKick(participant._id)}
                    />
                  ))}
                  {totalPlayers < 2 && (
                    <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                      <CardContent className="p-6 text-center">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">
                          Waiting for player...
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {layout === "row" && (
                <div className="grid grid-cols-5 gap-4">
                  {participants.map((participant) => (
                    <PlayerCardCompact
                      key={participant._id}
                      participant={participant}
                      isHost={participant._id === room.hostId}
                      isReady={room.readyPlayers.includes(participant._id)}
                      isYou={participant._id === user._id}
                      canKick={isHost && participant._id !== user._id}
                      onKick={() => handleKick(participant._id)}
                    />
                  ))}
                </div>
              )}

              {layout === "grid" && (
                <div className="grid grid-cols-5 gap-3">
                  {participants.map((participant) => (
                    <PlayerCardCompact
                      key={participant._id}
                      participant={participant}
                      isHost={participant._id === room.hostId}
                      isReady={room.readyPlayers.includes(participant._id)}
                      isYou={participant._id === user._id}
                      canKick={isHost && participant._id !== user._id}
                      onKick={() => handleKick(participant._id)}
                    />
                  ))}
                </div>
              )}

              {layout === "list" && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {participants.map((participant) => (
                    <PlayerCardList
                      key={participant._id}
                      participant={participant}
                      isHost={participant._id === room.hostId}
                      isReady={room.readyPlayers.includes(participant._id)}
                      isYou={participant._id === user._id}
                      canKick={isHost && participant._id !== user._id}
                      onKick={() => handleKick(participant._id)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <Card className="bg-gray-50 mb-6">
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-4 text-center text-sm">
                  <div>
                    <Swords className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
                    <p className="text-gray-600">Topic</p>
                    <p
                      className="font-bold text-xs truncate"
                      title={(room as any).trackId ? "Selected Track" : "Random Mix"}
                    >
                      {(room as any).trackId ? "Selected" : "Random Mix"}
                    </p>
                  </div>
                  <div>
                    <Clock className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-gray-600">Items</p>
                    <p className="font-bold">{room.itemIds.length}</p>
                  </div>
                  <div>
                    <Users className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-gray-600">Mode</p>
                    <p className="font-bold">Multi-Player</p>
                  </div>
                  <div>
                    <Zap className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                    <p className="text-gray-600">Est. Time</p>
                    <p className="font-bold">{room.itemIds.length * 2} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleToggleReady}
                disabled={allReady}
                size="lg"
                className={`flex-1 ${
                  isReady
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isReady ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Ready! ({readyCount}/{totalPlayers})
                  </>
                ) : (
                  <>
                    <Swords className="h-5 w-5 mr-2" />
                    I'm Ready!
                  </>
                )}
              </Button>

              {isHost && totalPlayers >= room.minPlayers && (
                <Button
                  onClick={handleForceStart}
                  variant="outline"
                  size="lg"
                  className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Force Start
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Player Card Components
function PlayerCard({
  participant,
  isHost,
  isReady,
  isYou,
  canKick,
  onKick,
}: any) {
  return (
    <Card
      className={`text-center relative ${
        isReady
          ? "border-2 border-green-500 bg-green-50"
          : "border-2 border-gray-300"
      }`}
    >
      <CardContent className="p-6">
        {canKick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onKick}
            className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Avatar className="h-24 w-24 mx-auto mb-4">
          <AvatarFallback
            className={`${isYou ? "bg-purple-500" : "bg-blue-500"} text-white text-3xl`}
          >
            {(participant.name || "P")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center justify-center gap-2 mb-2">
          {isHost && <Crown className="h-4 w-4 text-amber-500" />}
          <h3 className="font-bold text-lg">
            {participant.name || "Player"}
            {isYou && " (You)"}
          </h3>
        </div>
        {isReady ? (
          <Badge className="bg-green-500 text-white">
            <Check className="h-3 w-3 mr-1" />
            Ready!
          </Badge>
        ) : (
          <Badge variant="outline">Waiting...</Badge>
        )}
      </CardContent>
    </Card>
  );
}

function PlayerCardCompact({
  participant,
  isHost,
  isReady,
  isYou,
  canKick,
  onKick,
}: any) {
  return (
    <Card
      className={`text-center relative ${
        isReady
          ? "border-2 border-green-500 bg-green-50"
          : "border-2 border-gray-300"
      }`}
    >
      <CardContent className="p-3">
        {canKick && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onKick}
            className="absolute top-1 right-1 h-5 w-5 p-0 text-red-500"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <Avatar className="h-12 w-12 mx-auto mb-2">
          <AvatarFallback
            className={`${isYou ? "bg-purple-500" : "bg-blue-500"} text-white text-sm`}
          >
            {(participant.name || "P")[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center justify-center gap-1 mb-1">
          {isHost && <Crown className="h-3 w-3 text-amber-500" />}
          <p className="font-bold text-xs truncate">
            {isYou ? "You" : participant.name?.split(" ")[0] || "Player"}
          </p>
        </div>
        {isReady ? (
          <div className="h-2 w-2 bg-green-500 rounded-full mx-auto" />
        ) : (
          <div className="h-2 w-2 bg-gray-300 rounded-full mx-auto" />
        )}
      </CardContent>
    </Card>
  );
}

function PlayerCardList({
  participant,
  isHost,
  isReady,
  isYou,
  canKick,
  onKick,
}: any) {
  return (
    <Card className={`${isReady ? "bg-green-50 border-green-300" : ""}`}>
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback
              className={`${isYou ? "bg-purple-500" : "bg-blue-500"} text-white`}
            >
              {(participant.name || "P")[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              {isHost && <Crown className="h-3 w-3 text-amber-500" />}
              <p className="font-bold text-sm">
                {participant.name || "Player"}
                {isYou && " (You)"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isReady ? (
            <Badge className="bg-green-500 text-white text-xs">Ready</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Waiting
            </Badge>
          )}
          {canKick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onKick}
              className="h-8 w-8 p-0 text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
