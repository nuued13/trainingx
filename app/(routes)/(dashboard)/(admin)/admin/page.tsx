"use client";

import { AdminLayout } from "@/components/admin";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Users,
  Activity,
  Swords,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = useQuery(api.admin.getDashboardStats);
  const signupTrend = useQuery(api.admin.getSignupTrend, { days: 30 });
  const usersWithStatus = useQuery(api.admin.listUsersWithStatus, { limit: 1 });

  const isLoading = stats === undefined;
  const statusCounts = usersWithStatus?.statusCounts;

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Overview of your platform metrics</p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Total Users */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  Total Students
                </h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-500">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-black text-blue-500">
                {stats?.totalUsers?.toLocaleString() || 0}
              </p>
            </div>

            {/* Active Today */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  Active Today
                </h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-500">
                  <Activity className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-black text-green-500">
                {stats?.activeToday?.toLocaleString() || 0}
              </p>
              <p className="text-xs font-bold text-slate-400 mt-1">
                {stats?.activeThisWeek || 0} this week
              </p>
            </div>

            {/* Practice Attempts */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  Practice (Week)
                </h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-500">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-black text-purple-500">
                {stats?.attemptsThisWeek?.toLocaleString() || 0}
              </p>
            </div>

            {/* Duels */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  Duels (Week)
                </h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-500">
                  <Swords className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-black text-orange-500">
                {stats?.duelsThisWeek?.toLocaleString() || 0}
              </p>
            </div>

            {/* AI Spend */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  AI Spend (30d)
                </h3>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-500">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-black text-cyan-500">
                ${stats?.aiSpend30Days?.toFixed(2) || "0.00"}
              </p>
            </div>

            {/* Pending Moderation */}
            <div
              className={`relative overflow-hidden rounded-3xl border bg-white p-6 transition-all hover:bg-slate-50 ${
                (stats?.pendingModeration || 0) > 0
                  ? "border-red-200"
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">
                  Pending Review
                </h3>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                    (stats?.pendingModeration || 0) > 0
                      ? "bg-red-100 text-red-500"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <p
                className={`text-4xl font-black ${
                  (stats?.pendingModeration || 0) > 0
                    ? "text-red-500"
                    : "text-slate-400"
                }`}
              >
                {stats?.pendingModeration || 0}
              </p>
            </div>
          </div>
        )}

        {/* Student Status Distribution */}
        {statusCounts && (
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-700">
                Student Status
              </h2>
              <Link
                href="/admin/users"
                className="text-sm font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Healthy */}
              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-green-700">Healthy</span>
                </div>
                <p className="text-3xl font-black text-green-600">
                  {statusCounts.healthy}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {statusCounts.all > 0
                    ? Math.round(
                        (statusCounts.healthy / statusCounts.all) * 100
                      )
                    : 0}
                  % of students
                </p>
              </div>

              {/* At Risk */}
              <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-orange-700">At Risk</span>
                </div>
                <p className="text-3xl font-black text-orange-600">
                  {statusCounts["at-risk"]}
                </p>
                <p className="text-xs text-orange-600 mt-1">Need attention</p>
              </div>

              {/* Inactive */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-slate-600">Inactive</span>
                </div>
                <p className="text-3xl font-black text-slate-500">
                  {statusCounts.inactive}
                </p>
                <p className="text-xs text-slate-500 mt-1">7+ days inactive</p>
              </div>
            </div>
          </div>
        )}

        {/* Signup Trend */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-700">
            Signups (Last 30 Days)
          </h2>
          {signupTrend === undefined ? (
            <div className="h-48 animate-pulse rounded bg-slate-100" />
          ) : !signupTrend || signupTrend.length === 0 ? (
            <div className="flex h-48 items-center justify-center">
              <p className="text-slate-400 font-medium">
                No signups in the last 30 days
              </p>
            </div>
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
                      className="w-full rounded-t bg-gradient-to-t from-blue-500 to-purple-500 transition-all hover:opacity-80"
                      style={{ height: `${Math.max(height, 8)}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-xs text-white group-hover:block z-10">
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
          <Link
            href="/admin/users"
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50 hover:border-blue-200"
          >
            <Users className="mb-3 h-8 w-8 text-blue-500" />
            <h3 className="font-bold text-slate-700 group-hover:text-blue-600">
              Manage Students
            </h3>
            <p className="text-sm text-slate-400">
              Search, view details, and analyze progress
            </p>
          </Link>
          {/* <Link
            href="/admin/content"
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50 hover:border-green-200"
          >
            <TrendingUp className="mb-3 h-8 w-8 text-green-500" />
            <h3 className="font-bold text-slate-700 group-hover:text-green-600">
              Content Health
            </h3>
            <p className="text-sm text-slate-400">
              Monitor item performance and find problems
            </p>
          </Link> */}
          <Link
            href="/admin/ai-costs"
            className="group rounded-3xl border border-slate-200 bg-white p-6 transition-all hover:bg-slate-50 hover:border-cyan-200"
          >
            <DollarSign className="mb-3 h-8 w-8 text-cyan-500" />
            <h3 className="font-bold text-slate-700 group-hover:text-cyan-600">
              AI Costs
            </h3>
            <p className="text-sm text-slate-400">
              Track spending and optimize AI usage
            </p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}
