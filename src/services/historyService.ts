import { auth, db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, Timestamp, serverTimestamp, deleteDoc, writeBatch, runTransaction } from 'firebase/firestore';
import { PolicyCase, hardcodedCases } from '@/services/caseService';
import { toast } from 'sonner';

export interface VisitedCase {
  id: string;
  title: string;
  category: string;
  timestamp: Timestamp | null;
  caseData?: any;
}

/**
 * Track case visit in user history
 */
export const trackCaseVisit = async (caseId: string, caseData: any): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('Cannot track case visit: No authenticated user');
    return;
  }

  try {
    // Get the case from hardcoded cases if available
    const hardcodedCase = hardcodedCases.find(c => c.id === caseId);
    
    // Use hardcoded data as priority, then fallback to provided data
    const title = hardcodedCase?.title || 
      (caseData?.title && typeof caseData.title === 'string' && caseData.title.trim() 
        ? caseData.title.trim()
        : caseData?.facility?.FAC_NAME
          ? `${caseData.facility.FAC_NAME} ${caseData.facility.FAC_STATE || ''}`.trim()
          : `Case ${caseId}`);
    
    const category = hardcodedCase?.category || 
      (caseData?.category && typeof caseData.category === 'string' && caseData.category.trim()
        ? caseData.category.trim()
        : 'Uncategorized');

    // Reference to the user's history collection
    const historyRef = doc(db, `users/${user.uid}/history`, caseId);

    // Prepare history data
    const historyData: VisitedCase = {
      id: caseId,
      title,
      category,
      timestamp: serverTimestamp() as Timestamp,
      caseData: {
        ...caseData,
        // Ensure proper title and category are stored
        title,
        category
      }
    };
    
    console.log('Storing history data:', JSON.stringify(historyData, null, 2));
    
    // Write directly to Firestore
    await setDoc(historyRef, historyData);
    
    console.log(`Case visit tracked: ${caseId}, Title: ${title}, Category: ${category}`);
  } catch (error) {
    console.error('Error tracking case visit:', error);
  }
};

/**
 * Get user's case visit history
 */
export const getCaseHistory = async (limitCount = 20): Promise<VisitedCase[]> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('Cannot get case history: No authenticated user');
    return [];
  }

  try {
    const historyRef = collection(db, `users/${user.uid}/history`);
    const historyQuery = query(historyRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(historyQuery);

    if (snapshot.empty) {
      console.log('No history found for user');
      return [];
    }

    const history = snapshot.docs.map(doc => {
      const data = doc.data() as VisitedCase;
      const caseId = doc.id;
      
      // First check hardcoded cases
      const hardcodedCase = hardcodedCases.find(c => c.id === caseId);
      
      // Use proper title fallbacks with hardcoded case as highest priority
      const title = hardcodedCase?.title || 
        (data.title && typeof data.title === 'string' && data.title.trim() && !data.title.startsWith('Case ') 
          ? data.title.trim() 
          : (data.caseData?.facility?.FAC_NAME 
              ? `${data.caseData.facility.FAC_NAME} ${data.caseData.facility.FAC_STATE || ''}`.trim()
              : `Case ${caseId}`));
            
      // Ensure we don't have nulls or undefined values
      return {
        ...data,
        id: caseId,
        title,
        category: hardcodedCase?.category || 
          (data.category && typeof data.category === 'string' && data.category.trim() 
            ? data.category.trim() 
            : 'Uncategorized')
      };
    });
    
    console.log(`Retrieved ${history.length} case history items for user ${user.uid}`);
    return history;
  } catch (error) {
    console.error('Error getting case history:', error);
    return [];
  }
};

/**
 * Delete a case from user history
 */
export const deleteHistoryItem = async (caseId: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('Cannot delete history item: No authenticated user');
    return;
  }

  try {
    const historyItemRef = doc(db, `users/${user.uid}/history`, caseId);
    await deleteDoc(historyItemRef);
    console.log(`Deleted case ${caseId} from history`);
  } catch (error) {
    console.error('Error deleting history item:', error);
    throw error;
  }
};

/**
 * Clear all user history
 */
export const clearAllHistory = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    console.warn('Cannot clear history: No authenticated user');
    return;
  }

  try {
    const historyRef = collection(db, `users/${user.uid}/history`);
    const historyQuery = query(historyRef);
    const snapshot = await getDocs(historyQuery);

    if (snapshot.empty) {
      console.log('No history to clear');
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleared all history for user ${user.uid}`);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

/**
 * Format a timestamp for display
 */
export const formatVisitTimestamp = (timestamp: Timestamp | null): string => {
  if (!timestamp) return 'Unknown time';
  
  const date = timestamp.toDate();
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // diff in seconds
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  
  // For different days, return the formatted time
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Group visited cases by date (for UI display)
 */
export const groupVisitedCasesByDate = (cases: VisitedCase[]): Record<string, VisitedCase[]> => {
  const groupedCases: Record<string, VisitedCase[]> = {};
  
  cases.forEach(caseItem => {
    if (!caseItem.timestamp) return;
    
    const date = caseItem.timestamp.toDate();
    const dateKey = date.toDateString();
    
    if (!groupedCases[dateKey]) {
      groupedCases[dateKey] = [];
    }
    
    groupedCases[dateKey].push(caseItem);
  });
  
  return groupedCases;
}; 