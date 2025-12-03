import { useState } from "react"
import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { ThumbsUp, ThumbsDown, Minus, MessageSquare, ChevronDown, Users, LayoutList } from "lucide-react"

type ViewMode = "byUser" | "byResponse"

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton({ colSpan = 6 }: { colSpan?: number }) {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-6 rounded" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      {colSpan === 6 && <TableCell><Skeleton className="h-4 w-48" /></TableCell>}
    </TableRow>
  )
}

function truncateText(text: string | undefined, maxLength: number): string {
  if (!text) return "—"
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "…"
}

function ReactionTotals({ positive, negative }: { positive: number; negative: number }) {
  return (
    <div className="flex items-center gap-1 font-mono text-sm">
      {positive > 0 && (
        <span className="text-green-600 dark:text-green-400">(+{positive})</span>
      )}
      {negative > 0 && (
        <span className="text-red-600 dark:text-red-400">(−{negative})</span>
      )}
      {positive === 0 && negative === 0 && (
        <span className="text-muted-foreground">(0)</span>
      )}
    </div>
  )
}

function NetSentimentBadge({ net, netSentiment }: { net: number; netSentiment: string }) {
  const variant = netSentiment === "positive"
    ? "success"
    : netSentiment === "negative"
    ? "destructive"
    : "secondary"

  const prefix = net > 0 ? "+" : ""

  return (
    <Badge variant={variant}>
      {prefix}{net} net
    </Badge>
  )
}

export function FeedbackTab() {
  const [viewMode, setViewMode] = useState<ViewMode>("byUser")

  const feedbackSummary = useQuery(api.dashboard.getFeedbackSummary, { days: 30 })
  const feedbackList = useQuery(api.dashboard.getFeedbackList, { limit: 50 })
  const feedbackByResponse = useQuery(api.dashboard.getFeedbackByResponse, { limit: 50 })

  const isLoading = feedbackSummary === undefined

  return (
    <div className="space-y-6">
      {/* Feedback Summary */}
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
                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackSummary?.total ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Positive</CardTitle>
                <ThumbsUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {feedbackSummary?.positivePercent ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {feedbackSummary?.positive ?? 0} responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Negative</CardTitle>
                <ThumbsDown className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {feedbackSummary?.negativePercent ?? 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {feedbackSummary?.negative ?? 0} responses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Neutral</CardTitle>
                <Minus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackSummary?.neutral ?? 0}
                </div>
                <p className="text-xs text-muted-foreground">responses</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Feedback List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Recent Feedback</CardTitle>
          <div className="flex items-center gap-1 rounded-lg border p-1">
            <Button
              variant={viewMode === "byUser" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("byUser")}
              className="gap-1.5"
            >
              <Users className="h-4 w-4" />
              By User
            </Button>
            <Button
              variant={viewMode === "byResponse" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("byResponse")}
              className="gap-1.5"
            >
              <LayoutList className="h-4 w-4" />
              By Response
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "byUser" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Reaction</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead className="min-w-[200px]">Question</TableHead>
                  <TableHead className="min-w-[200px]">Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackList === undefined ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : feedbackList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-sm">No feedback received yet</p>
                        <p className="text-xs mt-1 opacity-70">Feedback will appear here when users react to bot responses</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbackList.map((feedback: typeof feedbackList[number]) => (
                    <Collapsible key={feedback.id} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50 group">
                            <TableCell className="text-sm">
                              {formatDate(feedback.timestamp)}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {feedback.userName || feedback.userId}
                            </TableCell>
                            <TableCell>
                              <span className="text-lg">
                                {feedback.reaction === "+1" || feedback.reaction === "thumbsup"
                                  ? "👍"
                                  : feedback.reaction === "-1" || feedback.reaction === "thumbsdown"
                                  ? "👎"
                                  : `:${feedback.reaction}:`}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  feedback.sentiment === "positive"
                                    ? "success"
                                    : feedback.sentiment === "negative"
                                    ? "destructive"
                                    : "secondary"
                                }
                              >
                                {feedback.sentiment}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                              <span className="block truncate">
                                {truncateText(feedback.question, 80)}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                              <div className="flex items-center justify-between">
                                <span className="block truncate flex-1">
                                  {truncateText(feedback.response, 80)}
                                </span>
                                <ChevronDown className="h-4 w-4 ml-2 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={6} className="p-4">
                              <div className="space-y-3">
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Question</p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {feedback.question || "No question recorded"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {feedback.response || "No response recorded"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Reactions</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead className="min-w-[200px]">Question</TableHead>
                  <TableHead className="min-w-[200px]">Response</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackByResponse === undefined ? (
                  <>
                    <TableRowSkeleton colSpan={5} />
                    <TableRowSkeleton colSpan={5} />
                    <TableRowSkeleton colSpan={5} />
                  </>
                ) : feedbackByResponse.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
                        <p className="text-sm">No feedback received yet</p>
                        <p className="text-xs mt-1 opacity-70">Feedback will appear here when users react to bot responses</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  feedbackByResponse.map((item: typeof feedbackByResponse[number]) => (
                    <Collapsible key={item.queryId} asChild>
                      <>
                        <CollapsibleTrigger asChild>
                          <TableRow className="cursor-pointer hover:bg-muted/50 group">
                            <TableCell className="text-sm">
                              {formatDate(item.timestamp)}
                            </TableCell>
                            <TableCell>
                              <ReactionTotals positive={item.positive} negative={item.negative} />
                            </TableCell>
                            <TableCell>
                              <NetSentimentBadge net={item.net} netSentiment={item.netSentiment} />
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                              <span className="block truncate">
                                {truncateText(item.question, 80)}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-[250px]">
                              <div className="flex items-center justify-between">
                                <span className="block truncate flex-1">
                                  {truncateText(item.response, 80)}
                                </span>
                                <ChevronDown className="h-4 w-4 ml-2 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleTrigger>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={5} className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="text-muted-foreground">
                                    {item.total} reaction{item.total !== 1 ? "s" : ""} from {item.users.length} user{item.users.length !== 1 ? "s" : ""}
                                  </span>
                                  <span className="text-green-600 dark:text-green-400">
                                    👍 {item.positive}
                                  </span>
                                  <span className="text-red-600 dark:text-red-400">
                                    👎 {item.negative}
                                  </span>
                                  {item.neutral > 0 && (
                                    <span className="text-muted-foreground">
                                      😐 {item.neutral}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Question</p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {item.question || "No question recorded"}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-muted-foreground mb-1">Response</p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {item.response || "No response recorded"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
