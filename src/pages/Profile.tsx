import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, Mail, Briefcase, MapPin, Calendar, Edit, UserPlus, Award, Users, Shield, Check, MessageSquare, Lightbulb } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useUser, UserProfile } from '@/contexts/UserContext';
import { useChat } from '@/contexts/ChatContext';
import { toast } from 'sonner';
import { sendFriendRequest, checkIsFriend, getFriends } from '@/services/friendService';
import { Badge, getUserBadges } from '@/services/badgeService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Friend as FirebaseFriend } from '@/models/types';

interface Friend {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
}

// Local interface for displaying friends with the structure we need for the UI
interface FriendDisplay {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  photoURL: string | null;
}

const BadgeCard = ({ badge }: { badge: Badge }) => {
  // Define icons for different badge types
  const getBadgeIcon = () => {
    switch (badge.type) {
      case 'cases_joined':
        return <Shield className="h-8 w-8" />;
      case 'messages_sent':
        return <MessageSquare className="h-8 w-8" />;
      case 'case_solved':
        return <Check className="h-8 w-8" />;
      case 'first_case':
        return <Lightbulb className="h-8 w-8" />;
      default:
        return <Award className="h-8 w-8" />;
    }
  };

  // Define color schemes for different badge types
  const getBadgeColorClass = () => {
    switch (badge.type) {
      case 'cases_joined':
        return "bg-blue-800/20 text-blue-400 border-blue-500/30";
      case 'messages_sent':
        return "bg-green-800/20 text-green-400 border-green-500/30";
      case 'case_solved':
        return "bg-purple-800/20 text-purple-400 border-purple-500/30";
      case 'first_case':
        return "bg-amber-800/20 text-amber-400 border-amber-500/30";
      default:
        return "bg-slate-800/20 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <div className={`border rounded-lg p-4 flex items-center gap-4 transition-all ${getBadgeColorClass()} ${badge.unlocked ? 'opacity-100' : 'opacity-40'}`}>
      <div className="p-2 rounded-full">
        {getBadgeIcon()}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-sm">{badge.name}</h3>
        <p className="text-xs">{badge.description}</p>
        {badge.unlocked && badge.unlockedDate && (
          <div className="text-xs mt-1 opacity-70">
            Unlocked {new Date(badge.unlockedDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

const FriendCard = ({ friend, onMessageClick }: { friend: FriendDisplay, onMessageClick: (friendId: string) => void }) => {
  return (
    <div className="border rounded-lg p-4 flex items-center justify-between bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={friend.photoURL || undefined} alt={friend.username} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {friend.firstName?.[0]}{friend.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">{friend.username}</h3>
          <p className="text-sm text-muted-foreground">{`${friend.firstName || ''} ${friend.lastName || ''}`.trim()}</p>
        </div>
      </div>
      <Button size="sm" variant="ghost" onClick={() => onMessageClick(friend.id)}>
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const { startNewChat } = useChat();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [isCheckingFriend, setIsCheckingFriend] = useState(false);
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [friends, setFriends] = useState<FriendDisplay[]>([]);
  const [loadingBadges, setLoadingBadges] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username && !currentUser) return;
      
      try {
        setIsLoading(true);
        
        // If no username provided and we have currentUser, show current user's profile
        if (!username && currentUser) {
          setProfile(currentUser);
          await loadUserBadges(currentUser.uid);
          await loadUserFriends(currentUser.uid);
          setIsLoading(false);
          return;
        }
        
        // Query Firestore for the user with this username
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '==', username?.toLowerCase()),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('User not found');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as UserProfile;
        userData.uid = userDoc.id; // Ensure the uid is set from doc id
        
        setProfile(userData);
        
        // Load the user's badges and friends
        await loadUserBadges(userData.uid);
        await loadUserFriends(userData.uid);
        
        // Check if this user is a friend (only if it's not the current user's profile)
        if (currentUser && currentUser.uid !== userData.uid) {
          setIsCheckingFriend(true);
          const friendStatus = await checkIsFriend(userData.uid);
          setIsFriend(friendStatus);
          setIsCheckingFriend(false);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [username, currentUser]);

  const loadUserBadges = async (userId: string) => {
    try {
      setLoadingBadges(true);
      
      if (currentUser && currentUser.uid === userId) {
        // If it's the current user, get their badges using the service
        const userBadges = await getUserBadges();
        setBadges(userBadges.filter(badge => badge.unlocked));
      } else {
        // Otherwise, we might need to fetch them directly
        // For now, let's just not show badges for other users
        setBadges([]);
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoadingBadges(false);
    }
  };

  const loadUserFriends = async (userId: string) => {
    try {
      setLoadingFriends(true);
      // getFriends doesn't take a parameter - it uses the current user from auth
      // Only load friends if it's the current user's profile
      if (currentUser && currentUser.uid === userId) {
        const firebaseFriends = await getFriends();
        
        // Need to transform the Firebase Friend model to our UI component's expected format
        // For each friend, we need to fetch their user profile data to get username, etc.
        const friendsDisplay: FriendDisplay[] = await Promise.all(
          firebaseFriends.map(async (friend: FirebaseFriend) => {
            try {
              // Get the user profile for this friend
              const userDoc = await getDoc(doc(db, 'users', friend.friendId));
              if (userDoc.exists()) {
                const userData = userDoc.data() as UserProfile;
                return {
                  id: friend.friendId,
                  username: userData.username || friend.friendName, // Fallback to friend name if no username
                  firstName: userData.firstName || '',
                  lastName: userData.lastName || '',
                  photoURL: userData.photoURL || friend.friendPhotoURL
                };
              }
              
              // If user profile not found, construct from friend data
              return {
                id: friend.friendId,
                username: friend.friendName,
                firstName: '',
                lastName: '',
                photoURL: friend.friendPhotoURL
              };
            } catch (error) {
              console.error('Error fetching friend profile:', error);
              return {
                id: friend.friendId,
                username: friend.friendName,
                firstName: '',
                lastName: '',
                photoURL: friend.friendPhotoURL
              };
            }
          })
        );
        
        setFriends(friendsDisplay);
      } else {
        // For other users, we don't show their friends list
        setFriends([]);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSendMessage = async () => {
    if (profile) {
      try {
        const chatId = await startNewChat(profile.uid);
        navigate(`/chat/${chatId}`);
        toast.success('Chat started');
      } catch (error) {
        console.error('Error starting chat:', error);
        toast.error('Failed to start chat');
      }
    }
  };
  
  const handleSendFriendRequest = async () => {
    if (!profile) return;
    
    try {
      setIsSendingRequest(true);
      await sendFriendRequest(profile.uid, `${profile.firstName} ${profile.lastName}`.trim());
      toast.success('Friend request sent');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send friend request');
      console.error('Error sending friend request:', error);
    } finally {
      setIsSendingRequest(false);
    }
  };
  
  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  const handleMessageFriend = async (friendId: string) => {
    try {
      const chatId = await startNewChat(friendId);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error('Error starting chat with friend:', error);
      toast.error('Failed to start chat');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-red-500 font-semibold">{error || 'User not found'}</div>
            <Button variant="outline" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isOwnProfile = currentUser?.uid === profile.uid;
  const unlockedBadges = badges.filter(badge => badge.unlocked);

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - User info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.photoURL || undefined} alt={profile.username} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="mt-4 text-2xl font-bold">{profile.username}</h1>
                    <p className="text-muted-foreground">{`${profile.firstName} ${profile.lastName}`}</p>
                    
                    <div className="mt-6 flex gap-3">
                      {isOwnProfile ? (
                        <Button 
                          onClick={handleEditProfile}
                          className="w-full"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Profile
                        </Button>
                      ) : (
                        <>
                          <Button 
                            className="w-full" 
                            onClick={handleSendMessage}
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                          
                          {!isFriend && (
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={handleSendFriendRequest}
                              disabled={isSendingRequest || isCheckingFriend}
                            >
                              {isSendingRequest ? (
                                <Spinner size="sm" className="mr-2" />
                              ) : (
                                <UserPlus className="mr-2 h-4 w-4" />
                              )}
                              Add Friend
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div>{profile.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Education</div>
                      <div>{profile.education || 'Not specified'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-muted-foreground">Joined</div>
                      <div>
                        {profile.createdAt instanceof Date
                          ? profile.createdAt.toLocaleDateString()
                          : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right column - Bio and additional info */}
            <div className="md:col-span-2">
              <Tabs defaultValue="bio" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="bio">Bio</TabsTrigger>
                  {isOwnProfile && (
                    <>
                      <TabsTrigger value="badges" className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Badges
                        {unlockedBadges.length > 0 && (
                          <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                            {unlockedBadges.length}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="friends" className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Friends
                        {friends.length > 0 && (
                          <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
                            {friends.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </>
                  )}
                </TabsList>
              
                <TabsContent value="bio">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Bio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {profile.bio ? (
                        <div className="whitespace-pre-line">{profile.bio}</div>
                      ) : (
                        <div className="text-muted-foreground">No bio available</div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {isOwnProfile && (
                  <TabsContent value="badges">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Award className="h-5 w-5" /> Your Badges
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/badges')}>
                          View All
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loadingBadges ? (
                          <div className="flex justify-center py-8">
                            <Spinner />
                          </div>
                        ) : unlockedBadges.length > 0 ? (
                          <div className="space-y-3">
                            {unlockedBadges.map(badge => (
                              <BadgeCard key={badge.id} badge={badge} />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Award className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No badges unlocked yet</p>
                            <p className="text-sm mt-1">Start exploring cases to earn badges</p>
                            <Button variant="outline" className="mt-4" size="sm" onClick={() => navigate('/cases')}>
                              Browse Cases
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
                
                {isOwnProfile && (
                  <TabsContent value="friends">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" /> Your Friends
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/friends')}>
                          Manage Friends
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {loadingFriends ? (
                          <div className="flex justify-center py-8">
                            <Spinner />
                          </div>
                        ) : friends.length > 0 ? (
                          <div className="space-y-3">
                            {friends.map(friend => (
                              <FriendCard 
                                key={friend.id} 
                                friend={friend} 
                                onMessageClick={handleMessageFriend} 
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                            <p>No friends added yet</p>
                            <p className="text-sm mt-1">Connect with other users to collaborate</p>
                            <Button variant="outline" className="mt-4" size="sm" onClick={() => navigate('/friends')}>
                              Find Friends
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 