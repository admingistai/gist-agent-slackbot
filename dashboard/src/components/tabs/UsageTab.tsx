import { useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatNumber, formatDate } from "@/lib/utils"
import { Activity } from "lucide-react"

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-12" />
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    </TableRow>
  )
}

export function UsageTab() {
  const tokenUsage = useQuery(api.dashboard.getTokenUsage, { days: 30 })
  const queryLogs = useQuery(api.dashboard.getQueryLogs, { limit: 50 })

  const isLoading = tokenUsage === undefined

  return (
    <div className="space-y-6">
      {/* Token Usage Summary */}
      <div className="grid gap-4 md:grid-cols-4">
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {formatNumber(tokenUsage?.tokensToday ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {formatNumber(tokenUsage?.tokensThisWeek ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total (30d)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {formatNumber(tokenUsage?.tokensTotal ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">tokens</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg per Query</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">
                  {formatNumber(tokenUsage?.avgTokensPerQuery ?? 0)}
                </div>
                <p className="text-xs text-muted-foreground">tokens</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Query Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Query Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Tools</TableHead>
                <TableHead>Response Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {queryLogs === undefined ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : queryLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Activity className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-sm">No queries logged yet</p>
                      <p className="text-xs mt-1 opacity-70">Queries will appear here as users interact with the bot</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                queryLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {formatDate(log.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.userName || log.userId}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="font-medium tabular-nums">{log.totalTokens}</span>
                        <span className="text-muted-foreground text-xs ml-1">
                          ({log.promptTokens}↑ {log.completionTokens}↓)
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.model}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {log.tools.map((tool) => (
                          <Badge key={tool} variant="secondary" className="text-xs">
                            {tool}
                          </Badge>
                        ))}
                        {log.tools.length === 0 && (
                          <span className="text-xs text-muted-foreground">
                            No tools
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {log.responseTimeMs}ms
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
