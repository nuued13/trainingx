"use client";

import { AdminLayout, StatsCard, DataTable } from "@/components/admin";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";

export default function AdminContent() {
  const healthData = useQuery(api.admin.getContentHealth);
  const problemItems = useQuery(api.admin.getProblemItems, { limit: 20 });

  const isLoading = healthData === undefined;

  const columns = [
    {
      key: "difficultyBand",
      header: "Difficulty",
      render: (item: any) => (
        <Badge
          variant={
            item.difficultyBand === "foundation"
              ? "secondary"
              : item.difficultyBand === "core"
              ? "default"
              : "destructive"
          }
        >
          {item.difficultyBand}
        </Badge>
      ),
    },
    {
      key: "elo",
      header: "Elo",
      render: (item: any) => <span>{item.elo}</span>,
    },
    {
      key: "attempts",
      header: "Attempts",
      render: (item: any) => <span>{item.attempts}</span>,
    },
    {
      key: "completionRate",
      header: "Completion",
      render: (item: any) => (
        <span
          className={
            item.completionRate < 50
              ? "text-red-500"
              : item.completionRate < 80
              ? "text-yellow-500"
              : "text-green-500"
          }
        >
          {item.completionRate}%
        </span>
      ),
    },
    {
      key: "correctRate",
      header: "Correct Rate",
      render: (item: any) => (
        <span
          className={
            item.correctRate < 30
              ? "text-red-500"
              : item.correctRate > 90
              ? "text-yellow-500"
              : "text-green-500"
          }
        >
          {item.correctRate}%
        </span>
      ),
    },
    {
      key: "issues",
      header: "Issues",
      render: (item: any) => (
        <div className="flex flex-wrap gap-1">
          {item.issues.map((issue: string) => (
            <Badge key={issue} variant="outline" className="text-xs">
              {issue}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Content Health</h1>
          <p className="text-muted-foreground">
            Monitor practice item performance
          </p>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Items"
              value={healthData?.totalItems || 0}
              icon={FileText}
            />
            <StatsCard
              title="Avg Completion"
              value={`${healthData?.completionRate || 0}%`}
              icon={CheckCircle}
            />
            <StatsCard
              title="Elo Convergence"
              value={`${healthData?.convergenceRate || 0}%`}
              description="Items with stable difficulty"
              icon={Target}
            />
            <StatsCard
              title="Avg Elo"
              value={healthData?.averageElo || 0}
              icon={TrendingUp}
            />
          </div>
        )}

        {/* Difficulty Distribution */}
        {healthData && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold">
              Difficulty Distribution
            </h2>
            <div className="flex h-12 overflow-hidden rounded-lg">
              <div
                className="flex items-center justify-center bg-green-500 text-white text-sm font-medium"
                style={{
                  width: `${
                    ((healthData.byBand.foundation || 0) /
                      healthData.totalItems) *
                    100
                  }%`,
                }}
              >
                {healthData.byBand.foundation > 0 &&
                  `${healthData.byBand.foundation}`}
              </div>
              <div
                className="flex items-center justify-center bg-blue-500 text-white text-sm font-medium"
                style={{
                  width: `${
                    ((healthData.byBand.core || 0) / healthData.totalItems) *
                    100
                  }%`,
                }}
              >
                {healthData.byBand.core > 0 && `${healthData.byBand.core}`}
              </div>
              <div
                className="flex items-center justify-center bg-orange-500 text-white text-sm font-medium"
                style={{
                  width: `${
                    ((healthData.byBand.challenge || 0) /
                      healthData.totalItems) *
                    100
                  }%`,
                }}
              >
                {healthData.byBand.challenge > 0 &&
                  `${healthData.byBand.challenge}`}
              </div>
            </div>
            <div className="mt-2 flex justify-between text-sm text-muted-foreground">
              <span>🟢 Foundation</span>
              <span>🔵 Core</span>
              <span>🟠 Challenge</span>
            </div>
          </div>
        )}

        {/* Problem Items */}
        <div>
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Problem Items</h2>
          </div>
          <DataTable
            data={problemItems || []}
            columns={columns}
            isLoading={problemItems === undefined}
            emptyMessage="No problem items found - content is healthy! 🎉"
          />
        </div>
      </div>
    </AdminLayout>
  );
}
