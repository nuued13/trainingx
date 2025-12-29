"use client";

import { useState } from "react";
import { AdminLayout, StatsCard, DataTable } from "@/components/admin";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Trophy, Flame, Calendar } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(
    null
  );

  const usersData = useQuery(api.admin.listUsers, {
    search: search || undefined,
    sortBy,
    limit: 50,
  });

  const userDetail = useQuery(
    api.admin.getUserDetail,
    selectedUserId ? { userId: selectedUserId } : "skip"
  );

  const columns = [
    {
      key: "user",
      header: "User",
      render: (user: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image} />
            <AvatarFallback>
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "totalScore",
      header: "Score",
      render: (user: any) => (
        <div className="flex items-center gap-1">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <span>{user.totalScore}</span>
        </div>
      ),
    },
    {
      key: "streak",
      header: "Streak",
      render: (user: any) => (
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-500" />
          <span>{user.streak}</span>
        </div>
      ),
    },
    {
      key: "lastActive",
      header: "Last Active",
      render: (user: any) => (
        <span className="text-sm text-muted-foreground">
          {new Date(user.lastActive).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: any) => (
        <div className="flex gap-1">
          {user.assessmentComplete && (
            <Badge variant="secondary" className="text-xs">
              Assessed
            </Badge>
          )}
          {user.badgesCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {user.badgesCount} badges
            </Badge>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">
            {usersData?.total || 0} total users
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="score">Highest Score</SelectItem>
              <SelectItem value="active">Last Active</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <DataTable
          data={usersData?.users || []}
          columns={columns}
          isLoading={usersData === undefined}
          onRowClick={(user) => setSelectedUserId(user._id)}
          emptyMessage="No users found"
        />

        {/* User Detail Modal */}
        <Dialog
          open={!!selectedUserId}
          onOpenChange={() => setSelectedUserId(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {userDetail ? (
              <div className="space-y-6">
                {/* Profile */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={userDetail.user.image} />
                    <AvatarFallback className="text-xl">
                      {userDetail.user.name?.charAt(0)?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">
                      {userDetail.user.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {userDetail.user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <Calendar className="mr-1 inline h-3 w-3" />
                      Joined{" "}
                      {new Date(userDetail.user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                {userDetail.stats && (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-2xl font-bold">
                        {userDetail.stats.promptScore}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prompt Score
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-2xl font-bold">
                        {userDetail.stats.totalScore}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total Score
                      </p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-2xl font-bold">
                        {userDetail.stats.streak}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Current Streak
                      </p>
                    </div>
                  </div>
                )}

                {/* Activity */}
                <div>
                  <h4 className="mb-2 font-semibold">Activity</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">
                        Practice Attempts
                      </span>
                      <span className="font-medium">
                        {userDetail.activity.practiceAttempts}
                      </span>
                    </div>
                    <div className="flex justify-between rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">
                        Duels Played
                      </span>
                      <span className="font-medium">
                        {userDetail.activity.duelsPlayed}
                      </span>
                    </div>
                    <div className="flex justify-between rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">
                        Posts Created
                      </span>
                      <span className="font-medium">
                        {userDetail.activity.postsCreated}
                      </span>
                    </div>
                    <div className="flex justify-between rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">
                        Content Created
                      </span>
                      <span className="font-medium">
                        {userDetail.activity.contentCreated}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badges */}
                {userDetail.stats?.badges &&
                  userDetail.stats.badges.length > 0 && (
                    <div>
                      <h4 className="mb-2 font-semibold">Badges</h4>
                      <div className="flex flex-wrap gap-2">
                        {userDetail.stats.badges.map((badge: string) => (
                          <Badge key={badge} variant="secondary">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
