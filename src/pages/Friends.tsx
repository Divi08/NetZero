import React, { useState, useEffect } from 'react';
import { 
  sendFriendRequest, 
  getIncomingFriendRequests, 
  getOutgoingFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriends,
  removeFriend,
  searchUsersByName
} from '@/services/friendService';
import { UserProfile } from '@/contexts/UserContext';
import { useUser } from '@/contexts/UserContext';
import { useChat } from '@/contexts/ChatContext';
import { FriendRequest, Friend } from '@/models/types';
import { toast } from 'sonner';
import { Search, Check, X, UserPlus, UserMinus, UserRoundCheck, Clock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Spinner } from '@/components/ui/spinner';
import { Sidebar } from '@/components/layout/Sidebar';

export default function Friends() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState({
    friends: false,
    incoming: false,
    outgoing: false,
    search: false,
    action: false
  });
  
  // Add state for tracking individual button loading states
  const [loadingButtons, setLoadingButtons] = useState<{[key: string]: boolean}>({});

  const { user } = useUser();
  const { startNewChat } = useChat();

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(prev => ({ ...prev, friends: true }));
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      toast.error('Failed to load friends');
      console.error('Error loading friends:', error);
    } finally {
      setLoading(prev => ({ ...prev, friends: false }));
    }
  };

  const loadFriendRequests = async () => {
    try {
      setLoading(prev => ({ ...prev, incoming: true, outgoing: true }));
      const [incoming, outgoing] = await Promise.all([
        getIncomingFriendRequests(),
        getOutgoingFriendRequests()
      ]);
      setIncomingRequests(incoming);
      setOutgoingRequests(outgoing);
    } catch (error) {
      toast.error('Failed to load friend requests');
      console.error('Error loading friend requests:', error);
    } finally {
      setLoading(prev => ({ ...prev, incoming: false, outgoing: false }));
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, search: true }));
      const results = await searchUsersByName(searchTerm);
      setSearchResults(results);
    } catch (error) {
      toast.error('Failed to search for users');
      console.error('Error searching for users:', error);
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  const handleSendRequest = async (userId: string, userName: string) => {
    try {
      setLoadingButtons(prev => ({ ...prev, [`send-${userId}`]: true }));
      await sendFriendRequest(userId, userName);
      toast.success('Friend request sent');
      // Update outgoing requests list
      loadFriendRequests();
      // Remove from search results
      setSearchResults(prev => prev.filter(user => user.uid !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send friend request');
      console.error('Error sending friend request:', error);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`send-${userId}`]: false }));
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // Set loading state for this specific button
      setLoadingButtons(prev => ({ ...prev, [`accept-${requestId}`]: true }));
      await acceptFriendRequest(requestId);
      toast.success('Friend request accepted');
      // Update lists
      loadFriends();
      loadFriendRequests();
    } catch (error) {
      toast.error('Failed to accept friend request');
      console.error('Error accepting friend request:', error);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`accept-${requestId}`]: false }));
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setLoadingButtons(prev => ({ ...prev, [`reject-${requestId}`]: true }));
      await rejectFriendRequest(requestId);
      toast.success('Friend request rejected');
      // Update incoming requests list
      loadFriendRequests();
    } catch (error) {
      toast.error('Failed to reject friend request');
      console.error('Error rejecting friend request:', error);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`reject-${requestId}`]: false }));
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      setLoadingButtons(prev => ({ ...prev, [`cancel-${requestId}`]: true }));
      await cancelFriendRequest(requestId);
      toast.success('Friend request cancelled');
      // Update outgoing requests list
      loadFriendRequests();
    } catch (error) {
      toast.error('Failed to cancel friend request');
      console.error('Error cancelling friend request:', error);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`cancel-${requestId}`]: false }));
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    try {
      setLoadingButtons(prev => ({ ...prev, [`remove-${friendId}`]: true }));
      await removeFriend(friendId);
      toast.success('Friend removed');
      // Update friends list
      loadFriends();
    } catch (error) {
      toast.error('Failed to remove friend');
      console.error('Error removing friend:', error);
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`remove-${friendId}`]: false }));
    }
  };

  const handleMessageFriend = async (friendId: string) => {
    try {
      setLoadingButtons(prev => ({ ...prev, [`message-${friendId}`]: true }));
      // Start a new chat or navigate to existing chat with this friend
      await startNewChat(friendId);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Could not open chat. Please try again.');
    } finally {
      setLoadingButtons(prev => ({ ...prev, [`message-${friendId}`]: false }));
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Friends</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
              <CardDescription>Search for users to add them as friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search by name or username"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={loading.search}>
                  {loading.search ? <Spinner size="sm" /> : <Search size={18} />}
                  <span className="ml-2">Search</span>
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Search Results</h3>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {searchResults.map((user) => (
                        <div key={user.uid} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={user.photoURL} />
                              <AvatarFallback>{getInitials(`${user.firstName} ${user.lastName}`)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-muted-foreground">@{user.username}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSendRequest(user.uid, `${user.firstName} ${user.lastName}`)}
                            disabled={loadingButtons[`send-${user.uid}`]}
                          >
                            {loadingButtons[`send-${user.uid}`] ? <Spinner size="sm" /> : <UserPlus size={16} className="mr-1" />}
                            Add Friend
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="friends">
            <TabsList className="mb-4">
              <TabsTrigger value="friends">
                Friends
                {friends.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{friends.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="incoming">
                Incoming Requests
                {incomingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{incomingRequests.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing">
                Outgoing Requests
                {outgoingRequests.length > 0 && (
                  <Badge variant="secondary" className="ml-2">{outgoingRequests.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="friends">
              <Card>
                <CardHeader>
                  <CardTitle>Your Friends</CardTitle>
                  <CardDescription>People you've connected with</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.friends ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                    </div>
                  ) : friends.length > 0 ? (
                    <div className="space-y-2">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={friend.friendPhotoURL} />
                              <AvatarFallback>{getInitials(friend.friendName)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{friend.friendName}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMessageFriend(friend.friendId)}
                              disabled={loadingButtons[`message-${friend.friendId}`]}
                            >
                              {loadingButtons[`message-${friend.friendId}`] ? <Spinner size="sm" /> : <Mail size={16} className="mr-1" />}
                              Message
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRemoveFriend(friend.friendId)}
                              disabled={loadingButtons[`remove-${friend.friendId}`]}
                            >
                              {loadingButtons[`remove-${friend.friendId}`] ? <Spinner size="sm" /> : <UserMinus size={16} className="mr-1" />}
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>You don't have any friends yet.</p>
                      <p>Search for people to connect with!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="incoming">
              <Card>
                <CardHeader>
                  <CardTitle>Incoming Friend Requests</CardTitle>
                  <CardDescription>People who want to connect with you</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.incoming ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                  </div>
                  ) : incomingRequests.length > 0 ? (
                    <div className="space-y-2">
                      {incomingRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={request.senderPhotoURL} />
                              <AvatarFallback>{getInitials(request.senderName)}</AvatarFallback>
                              </Avatar>
                              <div>
                              <p className="font-medium">{request.senderName}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAcceptRequest(request.id)}
                              disabled={loadingButtons[`accept-${request.id}`] || loadingButtons[`reject-${request.id}`]}
                            >
                              {loadingButtons[`accept-${request.id}`] ? <Spinner size="sm" /> : <Check size={16} className="mr-1" />}
                                Accept
                              </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectRequest(request.id)}
                              disabled={loadingButtons[`accept-${request.id}`] || loadingButtons[`reject-${request.id}`]}
                            >
                              {loadingButtons[`reject-${request.id}`] ? <Spinner size="sm" /> : <X size={16} className="mr-1" />}
                              Reject
                              </Button>
                            </div>
                          </div>
                    ))}
                  </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No pending friend requests.</p>
                  </div>
                )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="outgoing">
              <Card>
                <CardHeader>
                  <CardTitle>Outgoing Friend Requests</CardTitle>
                  <CardDescription>People you've invited to connect</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading.outgoing ? (
                    <div className="flex justify-center py-8">
                      <Spinner />
                  </div>
                  ) : outgoingRequests.length > 0 ? (
                    <div className="space-y-2">
                      {outgoingRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-2 border rounded-md">
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarFallback>{getInitials(request.receiverName)}</AvatarFallback>
                              </Avatar>
                              <div>
                              <p className="font-medium">{request.receiverName}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Clock size={14} className="mr-1" />
                                <span>Pending</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleCancelRequest(request.id)}
                            disabled={loadingButtons[`cancel-${request.id}`]}
                            className="ml-2"
                          >
                            {loadingButtons[`cancel-${request.id}`] ? <Spinner size="sm" /> : <X size={16} className="mr-1" />}
                            Cancel
                          </Button>
                        </div>
                    ))}
                  </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No outgoing friend requests.</p>
                  </div>
                )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
} 