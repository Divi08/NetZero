import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useCaseCommunityMessages, sendCaseCommunityMessage, sendZeroBotMessage, useCase } from '@/services/caseService';
import { getZeroBotResponse } from '@/services/geminiService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface CommunityChatProps {
  caseId: string;
}

export function CommunityChat({ caseId }: CommunityChatProps) {
  const { user } = useUser();
  const { data: messages, isLoading, error, refetch } = useCaseCommunityMessages(caseId);
  const { data: caseData } = useCase(caseId);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isProcessingBot, setIsProcessingBot] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check if message mentions @zero
  const checkForBotMention = async (messageContent: string, previousMessages: any[]) => {
    const mentionRegex = /@zero\s+(.*)/i;
    const match = messageContent.match(mentionRegex);
    
    if (match) {
      const botPrompt = match[1].trim();
      if (!botPrompt) return; // Empty prompt after @zero
      
      // Get the last few messages for context (excluding the current one)
      const contextMessages = previousMessages
        .slice(-3) // Get the last 3 messages
        .map(msg => `${msg.userName}: ${msg.content}`)
        .reverse(); // Most recent last
        
      // Add case information to context
      let caseContext = '';
      if (caseData) {
        caseContext = `This conversation is about an environmental case: "${caseData.title}". 
        Facility: ${caseData.facility?.FAC_NAME || 'Unknown'} in ${caseData.facility?.FAC_CITY || ''}, ${caseData.facility?.FAC_STATE || ''}. 
        Case status: ${caseData.status || 'Unknown'}. 
        Case summary: ${caseData.summary || 'No summary available'}.`;
      }
      
      // Add the case context to the beginning of the context messages
      if (caseContext) {
        contextMessages.unshift(caseContext);
      }
      
      setIsProcessingBot(true);
      try {
        // Get response from Gemini
        const response = await getZeroBotResponse(botPrompt, contextMessages);
        
        // Send bot message to chat
        await sendZeroBotMessage(caseId, response);
        
        // Refresh messages
        refetch();
      } catch (error) {
        console.error('Error processing bot request:', error);
        toast.error('Zero Bot is unavailable right now. Please try again later.');
      } finally {
        setIsProcessingBot(false);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setIsSending(true);
    try {
      // First, send user message
      await sendCaseCommunityMessage(caseId, newMessage.trim());
      
      // Check if we should trigger bot response
      if (messages) {
        await checkForBotMention(newMessage.trim(), messages);
      }
      
      setNewMessage('');
      refetch();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Highlight mentions of @zero in the message content
  const formatMessageContent = (content: string) => {
    const parts = content.split(/(@zero\b)/gi);
    
    return parts.map((part, index) => {
      if (part.toLowerCase() === '@zero') {
        return <span key={index} className="font-semibold text-primary">{part}</span>;
      }
      return part;
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-4 rounded-md">
        Error loading messages. Please refresh and try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <h3 className="font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          Community Discussion
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Join the conversation with other users about this case.
          Type <span className="font-semibold text-primary">@zero</span> to get AI assistance.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-background to-muted/20">
        {messages && messages.length > 0 ? (
          messages.map((message: any) => (
            <div 
              key={message.id} 
              className={`flex gap-3 ${message.userId === user?.uid ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-3 duration-300`}
            >
              {message.userId !== user?.uid && (
                <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                  {message.isBot ? (
                    <AvatarImage src="/logo.png" alt="Zero Bot" />
                  ) : message.userPhotoURL ? (
                    <AvatarImage src={message.userPhotoURL} alt={message.userName} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white">
                      {getInitials(message.userName)}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
              
              <div 
                className={`max-w-[75%] p-3 rounded-lg transition-all shadow-sm ${
                  message.isBot 
                    ? 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 rounded-tl-none' 
                    : message.userId === user?.uid 
                      ? 'bg-gradient-to-br from-primary to-primary-foreground text-white rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'
                }`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className={`font-medium text-xs ${message.isBot ? 'text-primary' : ''}`}>
                    {message.userId === user?.uid ? 'You' : message.userName}
                  </span>
                  <span className="text-xs opacity-70 ml-2">
                    {message.timestamp ? format(message.timestamp.toDate(), 'h:mm a') : 'Sending...'}
                  </span>
                </div>
                <p className="text-sm break-words leading-relaxed">
                  {message.isBot ? 
                    message.content : 
                    formatMessageContent(message.content)
                  }
                </p>
              </div>
              
              {message.userId === user?.uid && (
                <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
                  {user.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={`${user.firstName} ${user.lastName}`.trim() || 'You'} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary-foreground text-white">
                      {user.firstName && user.lastName ? getInitials(`${user.firstName} ${user.lastName}`) : 'YO'}
                    </AvatarFallback>
                  )}
                </Avatar>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 text-muted-foreground/50" />
            <p>No messages yet.</p>
            <p className="text-sm">Be the first to start the discussion!</p>
            <p className="text-xs mt-2">Try asking <span className="font-semibold text-primary">@zero</span> a question about this case.</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t bg-muted/30 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message... (Use @zero for AI assistance)"
          className="flex-1 border-muted-foreground/20 focus-visible:ring-primary"
          disabled={isSending || isProcessingBot || !user}
        />
        <Button 
          type="submit" 
          size="icon"
          className="rounded-full hover:shadow-md transition-all"
          disabled={isSending || isProcessingBot || !user || !newMessage.trim()}
        >
          {isSending || isProcessingBot ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
} 