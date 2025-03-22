
import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AICaseAssistant() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      content: "Hey! Having trouble finding an issue? I have access to a surplus of databases and resources that can help you create your next case!",
      isAi: true,
    },
    {
      id: "suggestion",
      content: "Based on recent ECHO database updates and satellite imagery, I've found something interesting. There's been an unusual pattern of temperature anomalies in Arctic permafrost regions, coupled with methane release signatures that don't match natural patterns. Local indigenous communities have reported unusual changes in vegetation. Could this be an undocumented feedback loop in climate dynamics? This might be worth investigating...",
      isAi: true,
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [
      ...prev, 
      { id: `user-${Date.now()}`, content: input, isAi: false }
    ]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          content: "I've searched through our climate databases for that issue. The EPA and TRACE API show several facilities with compliance issues in that region. Global emissions data indicates a significant contribution to carbon output. Would you like me to provide more specific information about regulatory frameworks or technical details for your case?",
          isAi: true
        }
      ]);
    }, 1000);
  };

  return (
    <Card className="mt-4 mb-6">
      <CardContent className="p-4">
        <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`max-w-[85%] rounded-xl p-3 ${
                msg.isAi 
                  ? 'bg-secondary text-secondary-foreground flex items-start gap-2' 
                  : 'bg-primary text-primary-foreground'
              }`}>
                {msg.isAi && <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                <p className="text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
        
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the AI for help finding an issue..."
            className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button 
            type="submit" 
            disabled={!input.trim()}
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
