import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, MessageSquare, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Message {
  role: "user" | "assistant"
  content: string
  responseTime?: number
  toolsUsed?: string[]
}

// Use the API URL from environment or default to relative path
const API_URL = import.meta.env.VITE_API_URL || ""

export function TestBotTab() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    try {
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch(`${API_URL}/api/test-bot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to get response")
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.response,
          responseTime: result.responseTimeMs,
          toolsUsed: result.toolsUsed,
        },
      ])
      toast.success("Response received", {
        description: `${result.responseTimeMs}ms`,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${errorMessage}`,
        },
      ])
      toast.error("Failed to get response", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    toast.info("Chat cleared")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Test Bot Response</CardTitle>
          {messages.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClear} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear Chat
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages */}
          <div className="min-h-[400px] max-h-[600px] overflow-y-auto rounded-xl border bg-muted/20 p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1 opacity-70">Send a message to test the bot</p>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  {(message.responseTime || message.toolsUsed) && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/50">
                      {message.responseTime && (
                        <Badge variant="secondary" className="text-xs tabular-nums">
                          {message.responseTime}ms
                        </Badge>
                      )}
                      {message.toolsUsed?.map((tool) => (
                        <Badge key={tool} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-background border rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message to test the bot..."
              className="min-h-[80px] resize-none rounded-xl"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-[80px] w-[80px] rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
