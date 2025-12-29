"use client";

import { AdminLayout, StatsCard } from "@/components/admin";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  Activity,
  Swords,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboard() {
  const stats = useQuery(api.admin.getDashboardStats);
  const signupTrend = useQuery(api.admin.getSignupTrend, { days: 30 });

  const isLoading = stats === undefined;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform metrics
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Total Users"
              value={stats?.totalUsers?.toLocaleString() || 0}
              icon={Users}
            />
            <StatsCard
              title="Active Today"
              value={stats?.activeToday?.toLocaleString() || 0}
              description={`${stats?.activeThisWeek || 0} this week`}
              icon={Activity}
            />
            <StatsCard
              title="Practice Attempts (Week)"
              value={stats?.attemptsThisWeek?.toLocaleString() || 0}
              icon={TrendingUp}
            />
            <StatsCard
              title="Duels This Week"
              value={stats?.duelsThisWeek?.toLocaleString() || 0}
              icon={Swords}
            />
            <StatsCard
              title="AI Spend (30d)"
              value={`$${stats?.aiSpend30Days?.toFixed(2) || "0.00"}`}
              icon={DollarSign}
            />
            <StatsCard
              title="Pending Moderation"
              value={stats?.pendingModeration || 0}
              icon={AlertTriangle}
              className={
                (stats?.pendingModeration || 0) > 0
                  ? "border-orange-500/50"
                  : ""
              }
            />
          </div>
        )}

        {/* Signup Trend */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Signups (Last 30 Days)</h2>
          {signupTrend === undefined ? (
            <div className="h-48 animate-pulse rounded bg-muted" />
          ) : signupTrend.length === 0 ? (
            <p className="text-muted-foreground">No signup data available</p>
          ) : (
            <div className="flex h-48 items-end gap-1">
              {signupTrend.map((day, i) => {
                const maxCount = Math.max(...signupTrend.map((d) => d.count));
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div
                    key={day.date}
                    className="group relative flex-1"
                    title={`${day.date}: ${day.count} signups`}
                  >
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all hover:from-blue-500 hover:to-blue-300"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                      {day.count}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <a
            href="/admin/users"
            className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
          >
            <Users className="mb-2 h-8 w-8 text-blue-500" />
            <h3 className="font-semibold">Manage Users</h3>
            <p className="text-sm text-muted-foreground">
              Search, view details, and analyze user activity
            </p>
          </a>
          <a
            href="/admin/content"
            className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
          >
            <TrendingUp className="mb-2 h-8 w-8 text-green-500" />
            <h3 className="font-semibold">Content Health</h3>
            <p className="text-sm text-muted-foreground">
              Monitor item performance and find problems
            </p>
          </a>
          <a
            href="/admin/ai-costs"
            className="rounded-xl border bg-card p-6 transition-colors hover:bg-muted/50"
          >
            <DollarSign className="mb-2 h-8 w-8 text-orange-500" />
            <h3 className="font-semibold">AI Costs</h3>
            <p className="text-sm text-muted-foreground">
              Track spending and optimize AI usage
            </p>
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
