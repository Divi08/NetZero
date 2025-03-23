import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useChat } from '@/contexts/ChatContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, ArrowLeft, User } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const Chat = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useUser();
  const { 
    chats, 
    messages, 
    currentChat, 
    selectChat, 
    sendMessage, 
    loading,
    loadingMessages
  } = useChat();
  const [messageText, setMessageText] = useState('');
  const [chatPartner, setChatPartner] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showChatList, setShowChatList] = useState(!chatId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [chatPartnerInfoCache, setChatPartnerInfoCache] = useState<Record<string, any>>({});
  
  useEffect(() => {
    if (chatId && chatId !== currentChat) {
      selectChat(chatId);
    }
  }, [chatId, selectChat, currentChat]);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (chatId) {
      setShowChatList(false);
    } else {
      setShowChatList(true);
    }
  }, [chatId]);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    // Get chat partner info for all chats
    const getAllChatPartners = async () => {
      if (!user) return;
      
      const partnerPromises = chats.map(async (chat) => {
        // Get the first participant ID that isn't the current user
        const partnerId = Object.keys(chat.participants || {}).find(id => id !== user.uid);
        if (!partnerId || chatPartnerInfoCache[partnerId]) return null;
        
        try {
          const userDoc = await getDoc(doc(db, 'users', partnerId));
          if (userDoc.exists()) {
            return { id: partnerId, data: userDoc.data() };
          }
        } catch (error) {
          console.error('Error fetching chat partner:', error);
        }
        return null;
      });
      
      const partnerResults = await Promise.all(partnerPromises);
      const newPartners = partnerResults
        .filter(Boolean)
        .reduce((acc, curr) => {
          if (curr) {
            acc[curr.id] = curr.data;
          }
          return acc;
        }, {} as Record<string, any>);
      
      if (Object.keys(newPartners).length > 0) {
        setChatPartnerInfoCache(prev => ({
          ...prev,
          ...newPartners
        }));
      }
    };
    
    getAllChatPartners();
  }, [chats, user, chatPartnerInfoCache]);
  
  // Effect to update current chat partner when chat changes
  useEffect(() => {
    if (!currentChat || !user) {
      setChatPartner(null);
      return;
    }
    
    const currentChatData = chats.find(c => c.id === currentChat);
    if (!currentChatData) return;
    
    // Get the first participant ID that isn't the current user
    const partnerId = Object.keys(currentChatData.participants || {}).find(id => id !== user.uid);
    if (!partnerId) return;
    
    // Check if we already have this partner in cache
    if (chatPartnerInfoCache[partnerId]) {
      setChatPartner(chatPartnerInfoCache[partnerId]);
    } else {
      // Fetch this partner specifically
      const getPartner = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', partnerId));
          if (userDoc.exists()) {
            const partnerData = userDoc.data();
            setChatPartner(partnerData);
            
            // Also update the cache
            setChatPartnerInfoCache(prev => ({
              ...prev,
              [partnerId]: partnerData
            }));
          }
        } catch (error) {
          console.error('Error fetching current chat partner:', error);
        }
      };
      
      getPartner();
    }
  }, [currentChat, user, chats, chatPartnerInfoCache]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    
    try {
      await sendMessage(messageText);
      setMessageText('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check your access rights or log in again.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    }
  };
  
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  const renderChatList = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold">Conversations</h2>
        <Button onClick={() => navigate('/search')} size="sm" variant="outline">
          New Chat
        </Button>
      </div>
      {loading ? (
        <div className="flex-grow flex items-center justify-center">
          <LoadingSpinner size="md" className="border-blue-500" />
        </div>
      ) : chats.length === 0 ? (
        <div className="flex-grow flex items-center justify-center p-4 text-center text-slate-400">
          <div>
            <p className="mb-4">No conversations yet.</p>
            <Button onClick={() => navigate('/search')} variant="outline">
              Find users to chat with
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto">
          {chats.map((chat) => {
            // Find the chat partner for this chat
            const partnerId = Object.keys(chat.participants || {}).find(id => id !== user?.uid) || '';
            const partnerInfo = chatPartnerInfoCache[partnerId] || { username: 'User' };
            
            return (
              <div
                key={chat.id}
                className={`p-4 border-b border-slate-700 hover:bg-slate-800 cursor-pointer ${
                  chat.id === currentChat ? 'bg-slate-800' : ''
                }`}
                onClick={() => selectChat(chat.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar>
                      <AvatarImage 
                        alt="User avatar"
                        src={partnerInfo.photoURL || `https://ui-avatars.com/api/?name=${partnerInfo.username}&background=random`}
                      />
                      <AvatarFallback><User size={18} /></AvatarFallback>
                    </Avatar>
                    {chat.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="font-medium truncate">{partnerInfo.username || 'User'}</span>
                      <span className="text-xs text-slate-400">
                        {chat.lastMessage?.timestamp 
                          ? formatMessageTime(chat.lastMessage.timestamp)
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 truncate">
                      {chat.lastMessage?.text || 'Start a conversation'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
  
  const renderChatMessages = () => {
    if (!currentChat) {
      return (
        <div className="h-full flex items-center justify-center text-center p-4 text-slate-400">
          Select a conversation or start a new one to begin chatting.
        </div>
      );
    }
    
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowChatList(true)}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          
          {chatPartner ? (
            <>
              <Avatar>
                <AvatarImage 
                  alt={chatPartner.username || 'User'}
                  src={chatPartner.photoURL || `https://ui-avatars.com/api/?name=${chatPartner.username}&background=random`}
                />
                <AvatarFallback><User size={18} /></AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{chatPartner.username || 'User'}</div>
                <div className="text-xs text-slate-400">
                  {chatPartner.isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-600 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-600 rounded animate-pulse" />
                <div className="h-3 w-16 bg-slate-700 rounded animate-pulse" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 space-y-4">
          {loadingMessages ? (
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" className="border-blue-500" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderId === user?.uid;
              
              return (
                <div 
                  key={msg.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-slate-700 text-white rounded-bl-none'
                    }`}
                  >
                    <p className="break-words">{msg.text}</p>
                    <div 
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp ? formatMessageTime(msg.timestamp) : 'Sending...'}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="bg-slate-700 border-slate-600 text-white"
            />
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    );
  };
  
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile responsive handling */}
        {isMobile ? (
          showChatList ? renderChatList() : renderChatMessages()
        ) : (
          <>
            <div className="w-1/3 border-r border-slate-700 overflow-hidden">
              {renderChatList()}
            </div>
            <div className="w-2/3 overflow-hidden">
              {renderChatMessages()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat; 