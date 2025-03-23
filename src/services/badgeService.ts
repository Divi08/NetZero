import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, serverTimestamp, increment, Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export interface Badge {
  id: string;
  name: string;
  description: string;
  type: 'cases_joined' | 'messages_sent' | 'case_solved' | 'first_case' | 'other';
  category: string; 
  unlocked: boolean;
  unlockedDate?: Date | null;
  progress?: number; // 0-100
  threshold?: number; // Value required to unlock
  currentValue?: number; // Current user's value
}

// Badge definitions for the available badges in the app
export const BADGE_DEFINITIONS: Badge[] = [
  // Cases Joined Badges
  {
    id: 'first_case_join',
    name: 'First Steps',
    description: 'Join your first case',
    type: 'first_case',
    category: 'Case Participation',
    unlocked: false,
    threshold: 1
  },
  {
    id: 'case_explorer',
    name: 'Case Explorer',
    description: 'Join 5 different cases',
    type: 'cases_joined',
    category: 'Case Participation',
    unlocked: false,
    threshold: 5
  },
  {
    id: 'case_veteran',
    name: 'Case Veteran',
    description: 'Join 15 different cases',
    type: 'cases_joined',
    category: 'Case Participation',
    unlocked: false,
    threshold: 15
  },
  {
    id: 'case_expert',
    name: 'Case Expert',
    description: 'Join 30 different cases',
    type: 'cases_joined',
    category: 'Case Participation',
    unlocked: false,
    threshold: 30
  },
  
  // Message Badges
  {
    id: 'first_message',
    name: 'First Message',
    description: 'Send your first message in a case discussion',
    type: 'messages_sent',
    category: 'Communication',
    unlocked: false,
    threshold: 1
  },
  {
    id: 'active_participant',
    name: 'Active Participant',
    description: 'Send 25 messages across all case discussions',
    type: 'messages_sent',
    category: 'Communication',
    unlocked: false,
    threshold: 25
  },
  {
    id: 'communicator',
    name: 'Communicator',
    description: 'Send 100 messages across all case discussions',
    type: 'messages_sent',
    category: 'Communication',
    unlocked: false,
    threshold: 100
  },
  
  // Case Solving Badges
  {
    id: 'problem_solver',
    name: 'Problem Solver',
    description: 'Solve your first case',
    type: 'case_solved',
    category: 'Achievement',
    unlocked: false,
    threshold: 1
  },
  {
    id: 'solution_master',
    name: 'Solution Master',
    description: 'Solve 5 cases',
    type: 'case_solved',
    category: 'Achievement',
    unlocked: false,
    threshold: 5
  }
];

/**
 * Get all badges for the current user
 */
export const getUserBadges = async (): Promise<Badge[]> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('Cannot get badges: No authenticated user');
    return [];
  }

  try {
    // Get the user's badge data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.warn('User document not found');
      return BADGE_DEFINITIONS;
    }
    
    const userData = userDoc.data();
    const userBadges = userData.badges || [];
    const userStats = userData.stats || { casesJoined: 0, messagesSent: 0, casesSolved: 0 };
    
    // Create a map of unlocked badges for quick lookup
    const unlockedBadgesMap = userBadges.reduce((acc: Record<string, any>, badge: any) => {
      acc[badge.id] = badge;
      return acc;
    }, {});
    
    // Merge badge definitions with user's badge status
    return BADGE_DEFINITIONS.map(badgeDef => {
      const userBadge = unlockedBadgesMap[badgeDef.id];
      let progress = 0;
      let currentValue = 0;
      
      // Calculate progress based on badge type
      if (badgeDef.threshold) {
        switch (badgeDef.type) {
          case 'cases_joined':
          case 'first_case':
            currentValue = userStats.casesJoined || 0;
            progress = Math.min(100, Math.floor((currentValue / badgeDef.threshold) * 100));
            break;
          case 'messages_sent':
            currentValue = userStats.messagesSent || 0;
            progress = Math.min(100, Math.floor((currentValue / badgeDef.threshold) * 100));
            break;
          case 'case_solved':
            currentValue = userStats.casesSolved || 0;
            progress = Math.min(100, Math.floor((currentValue / badgeDef.threshold) * 100));
            break;
        }
      }
      
      return {
        ...badgeDef,
        unlocked: !!userBadge,
        unlockedDate: userBadge ? userBadge.unlockedDate?.toDate() : null,
        progress,
        currentValue
      };
    });
  } catch (error) {
    console.error('Error getting user badges:', error);
    toast.error('Failed to load badges');
    return [];
  }
};

/**
 * Unlock a badge for the current user
 */
export const unlockBadge = async (badgeId: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('Cannot unlock badge: No authenticated user');
    return false;
  }

  try {
    const badgeToUnlock = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!badgeToUnlock) {
      console.warn(`Badge ${badgeId} not found in definitions`);
      return false;
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    
    // Check if user already has this badge
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      console.warn('User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    const userBadges = userData.badges || [];
    
    // Check if badge is already unlocked
    if (userBadges.some((b: any) => b.id === badgeId)) {
      console.log(`Badge ${badgeId} already unlocked`);
      return true;
    }
    
    // Unlock the badge
    const badgeData = {
      id: badgeId,
      name: badgeToUnlock.name,
      type: badgeToUnlock.type,
      unlockedDate: new Date()
    };
    
    await updateDoc(userDocRef, {
      badges: arrayUnion(badgeData)
    });
    
    toast.success(`Badge unlocked: ${badgeToUnlock.name}!`);
    console.log(`Badge ${badgeId} unlocked for user ${user.uid}`);
    return true;
  } catch (error) {
    console.error('Error unlocking badge:', error);
    return false;
  }
};

/**
 * Check and update badges based on user statistics
 */
export const checkAndUpdateBadges = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) return;
    
    const userData = userDoc.data();
    const userStats = userData.stats || { casesJoined: 0, messagesSent: 0, casesSolved: 0 };
    
    // Check case joined badges
    if (userStats.casesJoined >= 1) {
      await unlockBadge('first_case_join');
    }
    if (userStats.casesJoined >= 5) {
      await unlockBadge('case_explorer');
    }
    if (userStats.casesJoined >= 15) {
      await unlockBadge('case_veteran');
    }
    if (userStats.casesJoined >= 30) {
      await unlockBadge('case_expert');
    }
    
    // Check message badges
    if (userStats.messagesSent >= 1) {
      await unlockBadge('first_message');
    }
    if (userStats.messagesSent >= 25) {
      await unlockBadge('active_participant');
    }
    if (userStats.messagesSent >= 100) {
      await unlockBadge('communicator');
    }
    
    // Check case solved badges
    if (userStats.casesSolved >= 1) {
      await unlockBadge('problem_solver');
    }
    if (userStats.casesSolved >= 5) {
      await unlockBadge('solution_master');
    }
  } catch (error) {
    console.error('Error checking and updating badges:', error);
  }
};

/**
 * Update the user's stats when they join a case
 */
export const updateCaseJoinedStats = async (caseId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.warn('User document not found');
      return;
    }
    
    const userData = userDoc.data();
    const joinedCases = userData.joinedCases || [];
    
    // Skip if the user has already joined this case
    if (joinedCases.includes(caseId)) {
      return;
    }
    
    // Update the user's joined cases and stats
    await updateDoc(userDocRef, {
      joinedCases: arrayUnion(caseId),
      'stats.casesJoined': increment(1),
      'stats.lastUpdated': serverTimestamp()
    });
    
    // Check for any badges that should be unlocked
    await checkAndUpdateBadges();
  } catch (error) {
    console.error('Error updating case joined stats:', error);
  }
};

/**
 * Update the user's stats when they send a message
 */
export const updateMessageSentStats = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    
    await updateDoc(userDocRef, {
      'stats.messagesSent': increment(1),
      'stats.lastUpdated': serverTimestamp()
    });
    
    // Check for any badges that should be unlocked
    await checkAndUpdateBadges();
  } catch (error) {
    console.error('Error updating message sent stats:', error);
  }
};

/**
 * Update the user's stats when they solve a case
 */
export const updateCaseSolvedStats = async (caseId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) return;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.warn('User document not found');
      return;
    }
    
    const userData = userDoc.data();
    const solvedCases = userData.solvedCases || [];
    
    // Skip if the user has already solved this case
    if (solvedCases.includes(caseId)) {
      return;
    }
    
    // Update the user's solved cases and stats
    await updateDoc(userDocRef, {
      solvedCases: arrayUnion(caseId),
      'stats.casesSolved': increment(1),
      'stats.lastUpdated': serverTimestamp()
    });
    
    // Check for any badges that should be unlocked
    await checkAndUpdateBadges();
  } catch (error) {
    console.error('Error updating case solved stats:', error);
  }
};

/**
 * Check if the user has joined a specific case
 */
export const hasUserJoinedCase = async (caseId: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.warn('User document not found');
      return false;
    }
    
    const userData = userDoc.data();
    const joinedCases = userData.joinedCases || [];
    
    return joinedCases.includes(caseId);
  } catch (error) {
    console.error('Error checking if user joined case:', error);
    return false;
  }
};

/**
 * Get the list of cases that the user has joined
 */
export const getUserJoinedCases = async (): Promise<string[]> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('Cannot get joined cases: No authenticated user');
    return [];
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.warn('User document not found');
      return [];
    }
    
    const userData = userDoc.data();
    return userData.joinedCases || [];
  } catch (error) {
    console.error('Error getting joined cases:', error);
    return [];
  }
}; 