import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Define the user profile type
export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  usernameDisplay: string;
  email: string;
  education: string;
  photoURL: string | null;
  bio: string;
  createdAt: Date | Timestamp;
  lastActive: Date | Timestamp;
  friends: string[];
  isOnline: boolean;
}

// Context interface
interface UserContextProps {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

// Create the context with a default value
const UserContext = createContext<UserContextProps>({
  user: null,
  isLoading: true,
  error: null,
  logout: async () => {},
  updateUserProfile: async () => {},
  refreshUserProfile: async () => {},
});

// Hook to use the user context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to convert Firestore timestamp to Date
  const convertTimestampToDate = (timestamp: Timestamp | Date | undefined | null): Date => {
    if (!timestamp) return new Date();
    if (timestamp instanceof Date) return timestamp;
    if ('toDate' in timestamp) return timestamp.toDate();
    return new Date();
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
      return null;
    }
  };

  // Ensure user profile exists
  const ensureUserProfile = async (authUser: any) => {
    if (!authUser) return null;
    
    try {
      // Try to fetch the profile
      const userProfile = await fetchUserProfile(authUser.uid);
      
      // If profile exists, return it
      if (userProfile) {
        return userProfile;
      }
      
      // If profile doesn't exist, create a basic one
      const newUserProfile: UserProfile = {
        uid: authUser.uid,
        email: authUser.email || '',
        firstName: '',
        lastName: '',
        username: authUser.email?.split('@')[0] || '',
        usernameDisplay: authUser.email?.split('@')[0] || '',
        bio: '',
        education: '',
        photoURL: authUser.photoURL,
        createdAt: new Date(),
        lastActive: new Date(),
        friends: [],
        isOnline: true
      };
      
      // Save the new profile
      await setDoc(doc(db, 'users', authUser.uid), {
        ...newUserProfile,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
      
      return newUserProfile;
    } catch (error) {
      console.error('Error ensuring user profile:', error);
      return null;
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setIsLoading(true);
      try {
        if (authUser) {
          // User is signed in - First try to get profile, then ensure it exists if needed
          let userProfile = await fetchUserProfile(authUser.uid);
          
          // If profile doesn't exist or had issues, try to create it
          if (!userProfile) {
            userProfile = await ensureUserProfile(authUser);
          }
          
          if (userProfile) {
            // Convert timestamps
            const createdAt = convertTimestampToDate(userProfile.createdAt);
            const lastActive = convertTimestampToDate(userProfile.lastActive);
            
            setUser({
              ...userProfile,
              createdAt,
              lastActive
            });
            
            setError(null);
          } else {
            console.error('Could not find or create user profile');
            setError('User profile not found and could not be created');
            setUser(null);
          }
        } else {
          // User is signed out
          setUser(null);
          setError(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError('Authentication error');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Sign out function
  const logout = async () => {
    try {
      if (auth.currentUser) {
        // Update online status in Firestore
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          lastActive: serverTimestamp(),
          isOnline: false
        });
      }
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user?.uid) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        lastActive: serverTimestamp()
      });
      
      // Refresh user data
      await refreshUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    
    try {
      const userProfile = await fetchUserProfile(auth.currentUser.uid);
      if (userProfile) {
        // Convert timestamps
        const createdAt = convertTimestampToDate(userProfile.createdAt);
        const lastActive = convertTimestampToDate(userProfile.lastActive);
        
        setUser({
          ...userProfile,
          createdAt,
          lastActive
        });
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
      setError('Failed to refresh profile');
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    error,
    logout,
    updateUserProfile,
    refreshUserProfile
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}; 