import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
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

// Define context type
interface UserContextType {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerUser: (email: string, password: string) => Promise<void>;
  updateUserStatus: (isOnline: boolean) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

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
        const userData = userDoc.data() as UserProfile;
        // Ensure dates are properly converted
        if (userData.createdAt) {
          userData.createdAt = convertTimestampToDate(userData.createdAt);
        }
        if (userData.lastActive) {
          userData.lastActive = convertTimestampToDate(userData.lastActive);
        }
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
      return null;
    }
  };

  // Ensure user profile exists
  const ensureUserProfile = async (authUser: User) => {
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

  // Method to refresh the user profile
  const refreshUserProfile = async () => {
    if (!auth.currentUser) return;
    
    try {
      setIsLoading(true);
      const freshProfile = await fetchUserProfile(auth.currentUser.uid);
      if (freshProfile) {
        setUser(freshProfile);
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setError('Failed to refresh user profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (authUser) {
          // Update the user's lastActive timestamp
          await updateDoc(doc(db, 'users', authUser.uid), {
            lastActive: serverTimestamp(),
            isOnline: true
          });
          
          // Get or create user profile
          const userProfile = await ensureUserProfile(authUser);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Authentication error');
      } finally {
        setIsLoading(false);
      }
    });
    
    // Set up beforeunload handler to update online status
    const handleBeforeUnload = async () => {
      if (auth.currentUser) {
        try {
          await updateDoc(doc(db, 'users', auth.currentUser.uid), {
            isOnline: false,
            lastActive: serverTimestamp()
          });
        } catch (err) {
          console.error('Error updating offline status:', err);
        }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Method to update user online status
  const updateUserStatus = async (isOnline: boolean) => {
    if (!auth.currentUser) return;
    
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        isOnline,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Sign out the user
  const logout = async () => {
    try {
      // Set the user as offline before signing out
      if (auth.currentUser) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid), {
          isOnline: false,
          lastActive: serverTimestamp()
        });
      }
      
      await signOut(auth);
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Logout failed');
    }
  };

  // Placeholder methods for login and registration
  // These would be implemented with Firebase Auth in a real app
  const login = async (email: string, password: string) => {
    // Implementation would use firebase/auth signInWithEmailAndPassword
    setError('Login not implemented in this demo');
  };

  const registerUser = async (email: string, password: string) => {
    // Implementation would use firebase/auth createUserWithEmailAndPassword
    setError('Registration not implemented in this demo');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        logout,
        registerUser,
        updateUserStatus,
        refreshUserProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 