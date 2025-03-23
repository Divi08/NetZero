import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserSearch from '@/components/users/UserSearch';
import { useUser } from '@/contexts/UserContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, MessageCircle, Clock, X, Check, UserX } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

type FriendRequest = {
  id: string;
  from: {
    uid: string;
    username: string;
    displayName: string;
    photoURL: string | null;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
};

export default function Friends() {
  const { user } = useUser();
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch friend requests and friends (placeholder, real implementation would use Firestore)
  useEffect(() => {
    const fetchFriendsData = async () => {
      if (!user) return;
      
      // This is just a placeholder - in a real app you would fetch from Firestore
      setFriendRequests([]);
      setFriends([]);
      setIsLoading(false);
    };
    
    fetchFriendsData();
  }, [user]);

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-100">Friends & Connections</h1>
            <p className="text-slate-400">Find and connect with other users</p>
          </div>
          
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="search">
                <User className="h-4 w-4 mr-2" />
                Search Users
              </TabsTrigger>
              <TabsTrigger value="requests">
                <Clock className="h-4 w-4 mr-2" />
                Friend Requests
                {friendRequests.length > 0 && (
                  <span className="ml-2 bg-blue-600 text-white text-xs py-0.5 px-2 rounded-full">
                    {friendRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="friends">
                <User className="h-4 w-4 mr-2" />
                My Friends
                {friends.length > 0 && (
                  <span className="ml-2 bg-slate-700 text-slate-300 text-xs py-0.5 px-2 rounded-full">
                    {friends.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="search">
              <UserSearch />
            </TabsContent>
            
            <TabsContent value="requests">
              <div className="p-4">
                <h2 className="text-xl font-bold text-slate-100 mb-4">Friend Requests</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner className="h-8 w-8 mx-auto" />
                    <p className="mt-2 text-sm text-slate-400">Loading friend requests...</p>
                  </div>
                ) : friendRequests.length > 0 ? (
                  <div className="space-y-4">
                    {friendRequests.map((request) => (
                      <Card key={request.id} className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={request.from.photoURL || undefined} alt={request.from.username} />
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {request.from.displayName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-slate-100">{request.from.username}</h3>
                                <p className="text-sm text-slate-400">{request.from.displayName}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button variant="ghost" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">No friend requests at the moment.</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="friends">
              <div className="p-4">
                <h2 className="text-xl font-bold text-slate-100 mb-4">My Friends</h2>
                
                {isLoading ? (
                  <div className="text-center py-8">
                    <LoadingSpinner className="h-8 w-8 mx-auto" />
                    <p className="mt-2 text-sm text-slate-400">Loading friends...</p>
                  </div>
                ) : friends.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map((friend) => (
                      <Card key={friend.uid} className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={friend.photoURL || undefined} alt={friend.username} />
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {friend.displayName.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium text-slate-100">{friend.username}</h3>
                                <p className="text-sm text-slate-400">{friend.displayName}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="icon">
                                <MessageCircle className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <UserX className="h-4 w-4 text-red-400" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-slate-400">You don't have any friends yet. Start by searching for users.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 