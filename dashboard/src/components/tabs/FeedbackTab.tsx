import { useQuery } from "convex/react"
import { api } from "../../../convex/_generated/api"
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
import { formatDate } from "@/lib/utils"
import { ThumbsUp, ThumbsDown, Minus, MessageSquare } from "lucide-react"

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

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-6 w-6 rounded" /></TableCell>
      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
    </TableRow>
  )
}

export function FeedbackTab() {
  const feedbackSummary = useQuery(api.dashboard.getFeedbackSummary, { days: 30 })
  const feedbackList = useQuery(api.dashboard.getFeedbackList, { limit: 50 })

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
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Reaction</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Comment</TableHead>
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
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-sm">No feedback received yet</p>
                      <p className="text-xs mt-1 opacity-70">Feedback will appear here when users react to bot responses</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                feedbackList.map((feedback: typeof feedbackList[number]) => (
                  <TableRow key={feedback.id}>
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
                    <TableCell className="text-sm text-muted-foreground">
                      {feedback.comment || "—"}
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
