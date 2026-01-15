"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "convex/_generated/api";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { DuelLobby } from "@/components/duels/DuelLobby";
import { DuelCardDeck } from "@/components/duels/DuelCardDeck";
import { Id } from "convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContextProvider";

export default function DuelGameplayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const roomId = params.duelId as Id<"practiceDuels">;
  const isInvite = searchParams.get("invite") === "true";

  const [hasJoined, setHasJoined] = useState(false);

  const roomDetails = useQuery(api.duels.getRoomDetails, { roomId });
  const joinRoom = useMutation(api.duels.joinRoom);

  // Auto-join if invite link
  useEffect(() => {
    if (isInvite && roomDetails?.room && user?._id && !hasJoined) {
      const room = roomDetails.room;
      // Only join if not already a participant and room is in lobby
      if (
        room.status === "lobby" &&
        !room.participants.includes(user._id as any)
      ) {
        joinRoom({
          userId: user._id as any,
          roomId,
        })
          .then(() => {
            setHasJoined(true);
          })
          .catch((err) => {
            console.error("Failed to join room:", err);
          });
      }
    }
  }, [isInvite, roomDetails, user, hasJoined, joinRoom, roomId]);

  if (!roomDetails) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading duel...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const { room } = roomDetails;

  // Show lobby if room is in lobby status
  if (room.status === "lobby") {
    return (
      <SidebarLayout>
        <DuelLobby
          roomId={roomId}
          onStart={() => {
            // Lobby will handle the transition to active
          }}
        />
      </SidebarLayout>
    );
  }

  // Show card-based gameplay (same UI as Practice Zone!)
  return (
    <SidebarLayout>
      <DuelCardDeck roomId={roomId} />
    </SidebarLayout>
  );
}
