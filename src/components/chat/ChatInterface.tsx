
import { useState, useRef, useEffect } from "react";
import { Send, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/components/ui/use-toast";

type ChatMessage = {
  id: string;
  content: string;
  sender: "user" | "other" | "ai";
  timestamp: Date;
};

export function ChatInterface({ caseId }: { caseId: string }) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: "Hello investigators! I'm your AI teammate that will aid in your journey. Let's see what this case is all about...",
      sender: "ai",
      timestamp: new Date(),
    },
    {
      id: "analysis",
      content: "Based on initial analysis, this case appears to involve abnormal methane levels detected in satellite imagery. The source could be related to natural gas infrastructure leaks. ECHO database shows several facilities in this region with prior emission violations. I recommend we gather local air quality data and check recent EPA reports.",
      sender: "ai",
      timestamp: new Date(Date.now() + 1000),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: newMessage,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setNewMessage("");
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: "I'm analyzing your message and searching our databases for relevant information. Please let me know if you need specific data about this case.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleAIAnalysis = () => {
    // Simulate AI analyzing recent messages
    toast({
      title: "AI Analysis Requested",
      description: "Analyzing recent messages and searching climate databases...",
      duration: 3000,
    });
    
    setTimeout(() => {
      const aiAnalysis: ChatMessage = {
        id: `analysis-${Date.now()}`,
        content: "After analyzing the recent conversation and searching through the ECHO database and satellite imagery, I've detected potential methane hotspots in the discussed region. EPA records show three facilities with recent violations. I've also found relevant research papers on similar methane leak patterns that might be helpful for this investigation.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiAnalysis]);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col">
      <Collapsible
        open={!isCollapsed}
        onOpenChange={(open) => setIsCollapsed(!open)}
        className="w-full"
      >
        <div className="border-b p-3 flex items-center justify-between">
          <h2 className="font-semibold">Case Discussion</h2>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4 max-h-[calc(100vh-15rem)] overflow-y-auto scrollbar-none">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex", {
                  "justify-end": message.sender === "user",
                  "justify-start": message.sender !== "user",
                })}
              >
                <div
                  className={cn("max-w-[80%] rounded-xl p-3 animate-fade-in", {
                    "bg-primary text-primary-foreground": message.sender === "user",
                    "bg-slate-200 dark:bg-slate-800": message.sender === "other",
                    "glass-surface": message.sender === "ai",
                  })}
                >
                  <p className="text-sm">{message.content}</p>
                  <div
                    className={cn("mt-1 text-xs", {
                      "text-primary-foreground/70": message.sender === "user",
                      "text-muted-foreground": message.sender !== "user",
                    })}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CollapsibleContent>
      </Collapsible>
      
      <form onSubmit={handleSend} className="border-t p-4 mt-auto">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            type="button"
            onClick={handleAIAnalysis}
            className="rounded-full bg-secondary p-2 text-secondary-foreground transition-colors hover:bg-secondary/90"
            title="Request AI Analysis"
          >
            <Bot className="h-4 w-4" />
          </Button>
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
