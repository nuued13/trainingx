"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Users,
  Target,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import Link from "next/link";

// Status filter options
const STATUS_FILTERS = [
  { value: "all", label: "All Students", icon: Users },
  { value: "healthy", label: "Healthy", icon: CheckCircle2 },
  { value: "at-risk", label: "At Risk", icon: AlertTriangle },
  { value: "inactive", label: "Inactive", icon: Clock },
];

// Sort options
const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "score", label: "Highest Score" },
  { value: "active", label: "Last Active" },
  { value: "streak", label: "Longest Streak" },
];

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const usersData = useQuery(api.admin.listUsersWithStatus, {
    search: search || undefined,
    sortBy,
    statusFilter,
    limit: 50,
  });

  const isLoading = usersData === undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Students</h1>
            <p className="text-slate-500">
              {usersData?.total || 0} total students
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const count =
              usersData?.statusCounts?.[
                filter.value as keyof typeof usersData.statusCounts
              ] || 0;
            const isActive = statusFilter === filter.value;

            return (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition-all ${
                  isActive
                    ? filter.value === "healthy"
                      ? "border-green-300 bg-green-50 text-green-700"
                      : filter.value === "at-risk"
                        ? "border-orange-300 bg-orange-50 text-orange-700"
                        : filter.value === "inactive"
                          ? "border-slate-300 bg-slate-100 text-slate-600"
                          : "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{filter.label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isActive
                      ? filter.value === "healthy"
                        ? "bg-green-200 text-green-800"
                        : filter.value === "at-risk"
                          ? "bg-orange-200 text-orange-800"
                          : filter.value === "inactive"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-blue-200 text-blue-800"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl border border-slate-200 focus:border-blue-300"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] rounded-xl border border-slate-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-2.5 transition-colors ${
                viewMode === "cards"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-slate-400 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 transition-colors ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-slate-400 hover:bg-slate-50"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* User Cards Grid / List */}
        {isLoading ? (
          <div
            className={
              viewMode === "cards"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-2"
            }
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={
                  viewMode === "cards"
                    ? "h-44 animate-pulse rounded-2xl bg-slate-100"
                    : "h-16 animate-pulse rounded-xl bg-slate-100"
                }
              />
            ))}
          </div>
        ) : usersData?.users.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No students found</p>
            <p className="text-sm text-slate-400">Try adjusting your filters</p>
          </div>
        ) : viewMode === "cards" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {usersData?.users.map((user) => (
              <Link
                key={user._id}
                href={`/admin/users/${user._id}`}
                className="group"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl border bg-white p-5 transition-all hover:bg-slate-50 ${
                    user.riskLevel === "healthy"
                      ? "border-slate-200 hover:border-green-300"
                      : user.riskLevel === "at-risk"
                        ? "border-orange-200 hover:border-orange-300"
                        : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Status Indicator */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        user.riskLevel === "healthy"
                          ? "bg-green-500"
                          : user.riskLevel === "at-risk"
                            ? "bg-orange-500"
                            : "bg-slate-300"
                      }`}
                    />
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="h-12 w-12 border border-slate-100">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-lg font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-4">
                    {/* Prompt Score */}
                    <div className="flex items-center gap-1.5">
                      <div className="relative h-10 w-10">
                        <svg className="h-10 w-10 -rotate-90">
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="4"
                          />
                          <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="4"
                            strokeDasharray={`${(user.promptScore / 100) * 100.53} 100.53`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Target className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-700">
                          {user.promptScore}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Score
                        </p>
                      </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-700">
                          {user.streak}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          Streak
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="flex items-center justify-between">
                    {/* Top Skills */}
                    <div className="flex gap-1">
                      {user.topSkills?.slice(0, 2).map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-[10px] capitalize bg-slate-100 text-slate-500 hover:bg-slate-100"
                        >
                          {skill.replace(/_/g, " ").slice(0, 12)}
                        </Badge>
                      ))}
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </div>

                  {/* Last Active */}
                  <p className="text-[10px] text-slate-400 mt-3 uppercase tracking-wide">
                    Last active:{" "}
                    {new Date(user.lastActive).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wide">
              <div className="col-span-4">Student</div>
              <div className="col-span-2 text-center">Score</div>
              <div className="col-span-2 text-center">Streak</div>
              <div className="col-span-2 text-center">Status</div>
              <div className="col-span-2 text-center">Last Active</div>
            </div>

            {/* Table Rows */}
            {usersData?.users.map((user, idx) => (
              <Link
                key={user._id}
                href={`/admin/users/${user._id}`}
                className="group"
              >
                <div
                  className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition-colors hover:bg-slate-50 ${
                    idx !== usersData.users.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  {/* Student Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-slate-100">
                      <AvatarImage src={user.image} />
                      <AvatarFallback className="text-sm font-bold bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-sm">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <Target className="h-4 w-4 text-blue-500" />
                    <span className="font-bold text-slate-700">
                      {user.promptScore}
                    </span>
                  </div>

                  {/* Streak */}
                  <div className="col-span-2 flex items-center justify-center gap-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="font-bold text-slate-700">
                      {user.streak}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-center">
                    <Badge
                      variant="outline"
                      className={`text-xs font-semibold ${
                        user.riskLevel === "healthy"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : user.riskLevel === "at-risk"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}
                    >
                      {user.riskLevel === "healthy" && "Healthy"}
                      {user.riskLevel === "at-risk" && "At Risk"}
                      {user.riskLevel === "inactive" && "Inactive"}
                    </Badge>
                  </div>

                  {/* Last Active */}
                  <div className="col-span-2 text-center text-sm text-slate-500">
                    {new Date(user.lastActive).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
