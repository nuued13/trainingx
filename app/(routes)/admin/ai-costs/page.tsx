"use client";

import { useState } from "react";
import { AdminLayout, StatsCard } from "@/components/admin";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DollarSign, Zap, Clock, CheckCircle, TrendingUp } from "lucide-react";

export default function AdminAICosts() {
  const [days, setDays] = useState(30);
  const costData = useQuery(api.admin.getAICostStats, { days });

  const isLoading = costData === undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Costs</h1>
            <p className="text-muted-foreground">
              Track AI evaluation spending and performance
            </p>
          </div>
          <Select
            value={String(days)}
            onValueChange={(v) => setDays(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatsCard
              title="Total Spend"
              value={`$${costData?.totalCost.toFixed(2) || "0.00"}`}
              icon={DollarSign}
            />
            <StatsCard
              title="Evaluations"
              value={costData?.totalEvaluations.toLocaleString() || 0}
              icon={Zap}
            />
            <StatsCard
              title="Cost per Eval"
              value={`$${costData?.avgCostPerEval.toFixed(4) || "0.0000"}`}
              icon={TrendingUp}
            />
            <StatsCard
              title="Avg Latency"
              value={`${costData?.avgLatencyMs || 0}ms`}
              icon={Clock}
            />
            <StatsCard
              title="Success Rate"
              value={`${costData?.successRate || 0}%`}
              icon={CheckCircle}
            />
          </div>
        )}

        {/* Cost by Day Chart */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Daily Spend</h2>
          {isLoading ? (
            <div className="h-48 animate-pulse rounded bg-muted" />
          ) : costData?.costByDay.length === 0 ? (
            <p className="text-muted-foreground">No cost data available</p>
          ) : (
            <div className="flex h-48 items-end gap-1">
              {costData?.costByDay.map((day) => {
                const maxCost = Math.max(
                  ...costData.costByDay.map((d) => d.cost)
                );
                const height = maxCost > 0 ? (day.cost / maxCost) * 100 : 0;
                return (
                  <div
                    key={day.date}
                    className="group relative flex-1"
                    title={`${day.date}: $${day.cost.toFixed(2)}`}
                  >
                    <div
                      className="w-full rounded-t bg-gradient-to-t from-orange-600 to-orange-400 transition-all hover:from-orange-500 hover:to-orange-300"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-foreground px-2 py-1 text-xs text-background group-hover:block">
                      ${day.cost.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Cost by Provider */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">By Provider</h2>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : costData?.costByProvider.length === 0 ? (
            <p className="text-muted-foreground">No provider data available</p>
          ) : (
            <div className="space-y-4">
              {costData?.costByProvider.map((provider) => {
                const percentage =
                  costData.totalCost > 0
                    ? (provider.cost / costData.totalCost) * 100
                    : 0;
                return (
                  <div key={provider.provider}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium capitalize">
                        {provider.provider}
                      </span>
                      <span className="text-muted-foreground">
                        ${provider.cost.toFixed(2)} ({provider.count} calls)
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Token Usage */}
        {costData && costData.totalTokens > 0 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-2 text-lg font-semibold">Token Usage</h2>
            <p className="text-3xl font-bold">
              {costData.totalTokens.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              Total tokens used in {days} days
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
