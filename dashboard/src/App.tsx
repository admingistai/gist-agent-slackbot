import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewTab } from "@/components/tabs/OverviewTab"
import { IngestedTab } from "@/components/tabs/IngestedTab"
import { UsageTab } from "@/components/tabs/UsageTab"
import { FeedbackTab } from "@/components/tabs/FeedbackTab"
import { TestBotTab } from "@/components/tabs/TestBotTab"
import { ModeToggle } from "@/components/mode-toggle"
import { Bot, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

function App() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bot className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight">Gist-Agent Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="ingested">Ingested Content</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="test">Test Bot</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="ingested">
            <IngestedTab />
          </TabsContent>

          <TabsContent value="usage">
            <UsageTab />
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackTab />
          </TabsContent>

          <TabsContent value="test">
            <TestBotTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
