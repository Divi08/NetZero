import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy, 
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from './UserContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  read: boolean;
}

interface Chat {
  id: string;
  participants: { [userId: string]: boolean };
  lastMessage?: {
    text: string;
    timestamp: any;
    senderId: string;
  };
  unreadCount: number;
}

interface ChatContextProps {
  chats: Chat[];
  currentChat: string | null;
  messages: Message[];
  selectChat: (chatId: string) => void;
  sendMessage: (text: string) => Promise<void>;
  startNewChat: (userId: string) => Promise<string>;
  loading: boolean;
  loadingMessages: boolean;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch user's chats
  useEffect(() => {
    if (!user) {
      setChats([]);
      setCurrentChat(null);
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where(`participants.${user.uid}`, '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatData: Chat[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        chatData.push({
          id: doc.id,
          participants: data.participants || {},
          lastMessage: data.lastMessage,
          unreadCount: data.messages?.filter((m: any) => 
            m.read === false && m.senderId !== user.uid
          )?.length || 0,
        });
      });
      
      // Sort chats by last message timestamp
      chatData.sort((a, b) => {
        const timeA = a.lastMessage?.timestamp?.toDate() || new Date(0);
        const timeB = b.lastMessage?.timestamp?.toDate() || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });
      
      setChats(chatData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading chats:", error);
      setLoading(false);
      if (error.code === 'permission-denied') {
        toast.error("Permission denied when loading chats. Please check your access rights.");
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch messages for current chat
  useEffect(() => {
    if (!currentChat || !user) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    const messagesRef = collection(db, 'chats', currentChat, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.timestamp,
          read: data.read || false,
        });
      });
      setMessages(messagesData);
      setLoadingMessages(false);
      
      // Mark messages as read
      messagesData.forEach(async (message) => {
        if (!message.read && message.senderId !== user.uid) {
          try {
            const messageRef = doc(db, 'chats', currentChat, 'messages', message.id);
            await updateDoc(messageRef, { read: true });
          } catch (error) {
            console.error("Error marking message as read:", error);
          }
        }
      });
    }, (error) => {
      console.error("Error loading messages:", error);
      setLoadingMessages(false);
      if (error.code === 'permission-denied') {
        toast.error("Permission denied when loading messages. Please check your access rights.");
      }
    });

    return () => unsubscribe();
  }, [currentChat, user]);

  const selectChat = (chatId: string) => {
    setCurrentChat(chatId);
    navigate(`/chat/${chatId}`);
  };

  const sendMessage = async (text: string) => {
    if (!user || !currentChat || !text.trim()) return;

    try {
      // First, verify chat exists and user is a participant
      const chatRef = doc(db, 'chats', currentChat);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
        toast.error('This chat no longer exists');
        throw new Error('Chat does not exist');
      }
      
      const chatData = chatDoc.data();
      if (!chatData.participants || !chatData.participants[user.uid]) {
        toast.error('You are not a participant in this chat');
        throw new Error('You are not a participant in this chat');
      }
      
      // Create the message object
      const message = {
        senderId: user.uid,
        text,
        timestamp: serverTimestamp(),
        read: false,
        chatId: currentChat,
      };
      
      // Add optimistic message to state immediately
      const optimisticId = uuidv4();
      const optimisticMessage: Message = {
        id: optimisticId,
        senderId: user.uid,
        text,
        timestamp: Timestamp.now(),
        read: false,
      };
      
      // Update local state with the optimistic message
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Add the message to Firestore
      const messagesRef = collection(db, 'chats', currentChat, 'messages');
      await addDoc(messagesRef, message);

      // Update last message in chat document
      await updateDoc(chatRef, {
        lastMessage: {
          text,
          timestamp: serverTimestamp(),
          senderId: user.uid,
        },
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.code === 'permission-denied') {
        toast.error('Permission denied when sending message. Please check your access rights.');
      } else if (!error.message.includes('not a participant') && !error.message.includes('does not exist')) {
        // Don't show duplicate error messages
        toast.error('Failed to send message. Please try again.');
      }
      throw error; // Re-throw to let component handle
    }
  };

  const startNewChat = async (userId: string): Promise<string> => {
    if (!user) throw new Error('You must be logged in to start a chat');
    if (user.uid === userId) throw new Error('Cannot start a chat with yourself');

    try {
      // Check if a chat already exists between these users
      const chatsRef = collection(db, 'chats');
      const q = query(
        chatsRef,
        where(`participants.${user.uid}`, '==', true)
      );

      const querySnapshot = await getDocs(q);
      // Find if there's an existing chat with this user
      const existingChat = querySnapshot.docs.find(doc => {
        const participants = doc.data().participants || {};
        return participants[userId] === true;
      });

      if (existingChat) {
        // Chat already exists, select it
        const existingChatId = existingChat.id;
        selectChat(existingChatId);
        return existingChatId;
      } else {
        // Verify the other user exists
        const otherUserRef = doc(db, 'users', userId);
        const otherUserDoc = await getDoc(otherUserRef);
        
        if (!otherUserDoc.exists()) {
          throw new Error('User not found');
        }
        
        // Create a new chat with both participants
        const participantsMap: { [key: string]: boolean } = {};
        participantsMap[user.uid] = true;
        participantsMap[userId] = true;
        
        const newChatRef = await addDoc(chatsRef, {
          participants: participantsMap,
          createdAt: serverTimestamp(),
          lastMessage: null // Initialize with no messages
        });
        
        selectChat(newChatRef.id);
        return newChatRef.id;
      }
    } catch (error: any) {
      console.error('Error creating chat:', error);
      if (error.code === 'permission-denied') {
        throw new Error('Permission denied when creating chat');
      }
      throw new Error('Failed to create chat');
    }
  };

  const value = {
    chats,
    currentChat,
    messages,
    selectChat,
    sendMessage,
    startNewChat,
    loading,
    loadingMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 