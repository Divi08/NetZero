import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MessageCircle, Mail, Briefcase, MapPin, Calendar } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useUser, UserProfile } from '@/contexts/UserContext';
import { useChat } from '@/contexts/ChatContext';
import { toast } from 'sonner';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useUser();
  const { startNewChat } = useChat();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!username) return;
      
      try {
        setIsLoading(true);
        // Query Firestore for the user with this username
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '==', username.toLowerCase()),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('User not found');
          return;
        }
        
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data() as UserProfile;
        
        setProfile(userData);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [username]);

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

  if (isLoading) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <LoadingSpinner className="h-8 w-8 mx-auto" />
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

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-sm text-slate-400 hover:text-slate-200 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column - User info */}
            <div className="space-y-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={profile.photoURL || undefined} alt={profile.usernameDisplay} />
                      <AvatarFallback className="bg-blue-600 text-white text-2xl">
                        {profile.firstName[0]}{profile.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <h1 className="mt-4 text-2xl font-bold text-slate-100">{profile.usernameDisplay}</h1>
                    <p className="text-slate-400">{`${profile.firstName} ${profile.lastName}`}</p>
                    
                    <div className="mt-6 flex gap-3">
                      {currentUser?.uid !== profile.uid && (
                        <Button 
                          className="w-full" 
                          onClick={handleSendMessage}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Message
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg">About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Email</div>
                      <div>{profile.email}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Education</div>
                      <div>{profile.education || 'Not specified'}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-slate-400 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm text-slate-400">Joined</div>
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
            <div className="md:col-span-2 space-y-6">
              <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-lg">Bio</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.bio ? (
                    <p className="text-slate-300">{profile.bio}</p>
                  ) : (
                    <p className="text-slate-400 italic">No bio available</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Additional sections can be added here */}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 