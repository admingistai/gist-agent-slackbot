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
import { formatRelativeTime } from "@/lib/utils"
import { ExternalLink, Database } from "lucide-react"

function CategoryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-20" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-12 mb-1" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  )
}

function TableRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
    </TableRow>
  )
}

export function IngestedTab() {
  const ingestionStats = useQuery(api.dashboard.getIngestionStats)

  const isLoading = ingestionStats === undefined
  const categories = ingestionStats?.byCategory ? Object.entries(ingestionStats.byCategory) : []

  return (
    <div className="space-y-6">
      {/* Category Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {isLoading ? (
          <>
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
            <CategoryCardSkeleton />
          </>
        ) : categories.length > 0 ? (
          categories.map(([category, count]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {category}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">URLs ingested</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-4">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Database className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No categories yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* All Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">All Ingested Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Added By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <>
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                  <TableRowSkeleton />
                </>
              ) : (!ingestionStats?.recentEntries || ingestionStats.recentEntries.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Database className="h-10 w-10 mb-3 opacity-50" />
                      <p className="text-sm">No content ingested yet</p>
                      <p className="text-xs mt-1 opacity-70">Use @gist-agent in Slack to ingest URLs</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ingestionStats.recentEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <span className="font-medium">
                        {String(entry.title || "Untitled")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {String(entry.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {String(entry.addedBy || "Unknown")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.addedAt
                        ? formatRelativeTime(new Date(Number(entry.addedAt)).getTime())
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {entry.url && (
                        <a
                          href={String(entry.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
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
