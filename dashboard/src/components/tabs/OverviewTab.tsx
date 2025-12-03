import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatNumber, formatRelativeTime } from "@/lib/utils"
import { Database, MessageSquare, Zap, ThumbsUp } from "lucide-react"

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

export function OverviewTab() {
  const ingestionStats = useQuery(api.dashboard.getIngestionStats)
  const tokenUsage = useQuery(api.dashboard.getTokenUsage, { days: 30 })
  const feedbackSummary = useQuery(api.dashboard.getFeedbackSummary, { days: 30 })

  const isLoading = ingestionStats === undefined || tokenUsage === undefined || feedbackSummary === undefined

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {ingestionStats?.totalUrls ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {Object.keys(ingestionStats?.byCategory ?? {}).length} categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queries Today</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {tokenUsage?.queryCount ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg {tokenUsage?.avgResponseTime ?? 0}ms response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokens Today</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(tokenUsage?.tokensToday ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(tokenUsage?.tokensThisWeek ?? 0)} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Feedback Score</CardTitle>
                <ThumbsUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackSummary?.positivePercent ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {feedbackSummary?.total ?? 0} total responses
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Knowledge Base by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {ingestionStats === undefined ? (
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-32 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {ingestionStats?.byCategory &&
                Object.entries(ingestionStats.byCategory).map(([category, count]: [string, unknown]) => (
                  <div
                    key={category}
                    className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-2.5 transition-colors hover:bg-muted/50"
                  >
                    <Badge variant="outline" className="font-medium">{category}</Badge>
                    <span className="text-lg font-bold tabular-nums">{String(count)}</span>
                    <span className="text-sm text-muted-foreground">URLs</span>
                  </div>
                ))}
              {(!ingestionStats?.byCategory || Object.keys(ingestionStats.byCategory).length === 0) && (
                <p className="text-sm text-muted-foreground">No categories yet</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Ingestions</CardTitle>
        </CardHeader>
        <CardContent>
          {ingestionStats === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {ingestionStats?.recentEntries?.slice(0, 5).map((entry: NonNullable<typeof ingestionStats>["recentEntries"][number]) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between rounded-lg px-2 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <p className="text-sm font-medium leading-none truncate">
                      {String(entry.title || "Untitled")}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {String(entry.url)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <Badge variant="secondary">{String(entry.category)}</Badge>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {entry.addedAt ? formatRelativeTime(new Date(Number(entry.addedAt)).getTime()) : ""}
                    </span>
                  </div>
                </div>
              ))}
              {(!ingestionStats?.recentEntries || ingestionStats.recentEntries.length === 0) && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Database className="h-10 w-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">No recent ingestions</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Use @gist-agent in Slack to ingest URLs</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
