import React, { useState } from 'react';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MessageCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import { useUser, UserProfile } from '@/contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useChat } from '@/contexts/ChatContext';

export default function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isStartingChat, setIsStartingChat] = useState<string | null>(null);
  const { user } = useUser();
  const { startNewChat } = useChat();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast.error('Please enter a username to search for');
      return;
    }
    
    setIsSearching(true);
    try {
      // Search for users where username contains the search term (case insensitive)
      const lowerSearchTerm = searchTerm.toLowerCase();
      const usersRef = collection(db, 'users');
      
      // Firebase doesn't support contains search directly, so we use startAt and endAt
      // for prefix search
      const q = query(
        usersRef,
        where('username', '>=', lowerSearchTerm),
        where('username', '<=', lowerSearchTerm + '\uf8ff'),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setSearchResults([]);
        toast.info('No users found with that username');
      } else {
        const results = snapshot.docs
          .map(doc => doc.data() as UserProfile)
          .filter(profile => profile.uid !== user?.uid); // Filter out current user
        
        setSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching for users:', error);
      toast.error('Failed to search for users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      setIsStartingChat(userId); // Show loading state for this specific user
      // Start a new chat with the selected user
      const chatId = await startNewChat(userId);
      toast.success('Chat started successfully');
      // Navigate to the chat page
      navigate(`/chat/${chatId}`);
    } catch (error: any) {
      console.error('Error starting chat:', error);
      // Display a more user-friendly error message
      if (error.message === 'Cannot start a chat with yourself') {
        toast.error("You can't message yourself");
      } else if (error.message === 'User not found') {
        toast.error("User not found");
      } else if (error.message === 'Failed to create chat') {
        toast.error('Could not create chat. Please try again later.');
      } else if (error.code === 'permission-denied') {
        toast.error('Permission denied. Please check that you are logged in.');
      } else {
        toast.error('Failed to start chat. Please try again.');
      }
    } finally {
      setIsStartingChat(null); // Hide loading state
    }
  };

  const handleViewProfile = (username: string) => {
    // Navigate to user profile
    navigate(`/profile/${username}`);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-100">Find Users</h2>
        <p className="text-sm text-slate-400">Search for users to chat with</p>
      </div>

      <form onSubmit={handleSearch} className="flex space-x-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by username..."
            className="pl-10 bg-slate-700/50 border-slate-600 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSearching}>
          {isSearching ? <LoadingSpinner size="sm" className="border-white" /> : 'Search'}
        </Button>
      </form>

      <div className="mt-6 space-y-4">
        {searchResults.length > 0 ? (
          searchResults.map((userProfile) => (
            <Card key={userProfile.uid} className="bg-slate-800/50 border-slate-700/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={userProfile.photoURL || undefined} alt={userProfile.usernameDisplay} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {userProfile.firstName && userProfile.lastName 
                          ? `${userProfile.firstName[0]}${userProfile.lastName[0]}`
                          : userProfile.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-slate-100">{userProfile.usernameDisplay}</h3>
                      <p className="text-sm text-slate-400">{`${userProfile.firstName} ${userProfile.lastName}`}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleViewProfile(userProfile.username)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleStartChat(userProfile.uid)}
                      disabled={isStartingChat === userProfile.uid}
                    >
                      {isStartingChat === userProfile.uid ? (
                        <LoadingSpinner size="sm" className="border-white mr-2" />
                      ) : (
                        <MessageCircle className="h-4 w-4 mr-2" />
                      )}
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          isSearching ? (
            <div className="text-center py-8">
              <LoadingSpinner className="h-8 w-8 mx-auto" />
              <p className="mt-2 text-sm text-slate-400">Searching for users...</p>
            </div>
          ) : (
            searchTerm && !isSearching && (
              <div className="text-center py-8">
                <p className="text-slate-400">No users found. Try a different search term.</p>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
} 