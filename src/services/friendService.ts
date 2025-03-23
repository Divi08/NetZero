import { db, auth } from '@/lib/firebase';
import { collection, doc, getDoc, getDocs, query, addDoc, updateDoc, deleteDoc, serverTimestamp, where, Timestamp, writeBatch } from 'firebase/firestore';
import { FriendRequest, Friend, FriendRequestStatus } from '@/models/types';
import { UserProfile } from '@/contexts/UserContext';

// Send a friend request
export async function sendFriendRequest(recipientId: string, recipientName: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to send friend requests');
  }

  // Check if there's already a pending request
  const existingRequestQuery = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', auth.currentUser.uid),
    where('receiverId', '==', recipientId),
    where('status', '==', FriendRequestStatus.PENDING)
  );
  
  const existingRequestSnapshot = await getDocs(existingRequestQuery);
  if (!existingRequestSnapshot.empty) {
    throw new Error('You already have a pending request to this user');
  }

  // Check if they already sent you a request
  const incomingRequestQuery = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', recipientId),
    where('receiverId', '==', auth.currentUser.uid),
    where('status', '==', FriendRequestStatus.PENDING)
  );
  
  const incomingRequestSnapshot = await getDocs(incomingRequestQuery);
  if (!incomingRequestSnapshot.empty) {
    throw new Error('This user has already sent you a friend request');
  }

  // Check if already friends
  const existingFriendQuery = query(
    collection(db, 'friends'),
    where('userId', '==', auth.currentUser.uid),
    where('friendId', '==', recipientId)
  );
  
  const existingFriendSnapshot = await getDocs(existingFriendQuery);
  if (!existingFriendSnapshot.empty) {
    throw new Error('You are already friends with this user');
  }

  // Get current user profile for name
  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
  if (!userDoc.exists()) {
    throw new Error('Your user profile could not be found');
  }
  
  const userData = userDoc.data() as UserProfile;
  
  // Create the friend request
  await addDoc(collection(db, 'friendRequests'), {
    senderId: auth.currentUser.uid,
    senderName: `${userData.firstName} ${userData.lastName}`.trim(),
    senderPhotoURL: userData.photoURL,
    receiverId: recipientId,
    receiverName: recipientName,
    status: FriendRequestStatus.PENDING,
    timestamp: serverTimestamp()
  });
}

// Get all pending friend requests received by the current user
export async function getIncomingFriendRequests(): Promise<FriendRequest[]> {
  if (!auth.currentUser) {
    return [];
  }

  const requestsQuery = query(
    collection(db, 'friendRequests'),
    where('receiverId', '==', auth.currentUser.uid),
    where('status', '==', FriendRequestStatus.PENDING)
  );
  
  const snapshot = await getDocs(requestsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as FriendRequest[];
}

// Get all pending friend requests sent by the current user
export async function getOutgoingFriendRequests(): Promise<FriendRequest[]> {
  if (!auth.currentUser) {
    return [];
  }

  const requestsQuery = query(
    collection(db, 'friendRequests'),
    where('senderId', '==', auth.currentUser.uid),
    where('status', '==', FriendRequestStatus.PENDING)
  );
  
  const snapshot = await getDocs(requestsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as FriendRequest[];
}

// Accept a friend request
export async function acceptFriendRequest(requestId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to accept friend requests');
  }

  // Get the request
  const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
  if (!requestDoc.exists()) {
    throw new Error('Friend request not found');
  }

  const request = requestDoc.data() as FriendRequest;
  
  // Verify current user is the recipient
  if (request.receiverId !== auth.currentUser.uid) {
    throw new Error('You can only accept friend requests sent to you');
  }

  try {
    // Start a batch to ensure all operations succeed or fail together
    const batch = writeBatch(db);
    
    // Update request status
    const requestRef = doc(db, 'friendRequests', requestId);
    batch.update(requestRef, {
      status: FriendRequestStatus.ACCEPTED
    });

    // Get current user profile for complete information
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (!userDoc.exists()) {
      throw new Error('Your user profile could not be found');
    }
    
    const userData = userDoc.data() as UserProfile;
    const currentUserName = `${userData.firstName} ${userData.lastName}`.trim();

    // Check if friendship already exists to prevent duplicates
    const existingFriendship1Query = query(
      collection(db, 'friends'),
      where('userId', '==', auth.currentUser.uid),
      where('friendId', '==', request.senderId)
    );
    
    const existingFriendship2Query = query(
      collection(db, 'friends'),
      where('userId', '==', request.senderId),
      where('friendId', '==', auth.currentUser.uid)
    );
    
    const [existingFriendship1Snapshot, existingFriendship2Snapshot] = await Promise.all([
      getDocs(existingFriendship1Query),
      getDocs(existingFriendship2Query)
    ]);

    // Only create this direction if it doesn't exist
    if (existingFriendship1Snapshot.empty) {
      // Create friend entry: Current user -> Sender
      const friend1Ref = doc(collection(db, 'friends'));
      batch.set(friend1Ref, {
        userId: auth.currentUser.uid,
        friendId: request.senderId,
        friendName: request.senderName,
        friendPhotoURL: request.senderPhotoURL,
        addedAt: serverTimestamp()
      });
    } else {
      console.log('Friendship already exists from current user to sender');
    }

    // Only create this direction if it doesn't exist
    if (existingFriendship2Snapshot.empty) {
      // Create friend entry: Sender -> Current user
      const friend2Ref = doc(collection(db, 'friends'));
      batch.set(friend2Ref, {
        userId: request.senderId,
        friendId: auth.currentUser.uid,
        friendName: currentUserName,
        friendPhotoURL: userData.photoURL,
        addedAt: serverTimestamp()
      });
    } else {
      console.log('Friendship already exists from sender to current user');
    }
    
    // Commit all operations atomically
    await batch.commit();
    console.log('Friend request accepted and friendship created in both directions');
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw new Error('Failed to accept friend request');
  }
}

// Reject a friend request
export async function rejectFriendRequest(requestId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to reject friend requests');
  }

  // Get the request
  const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
  if (!requestDoc.exists()) {
    throw new Error('Friend request not found');
  }

  const request = requestDoc.data() as FriendRequest;
  
  // Verify current user is the recipient
  if (request.receiverId !== auth.currentUser.uid) {
    throw new Error('You can only reject friend requests sent to you');
  }

  // Update request status
  await updateDoc(doc(db, 'friendRequests', requestId), {
    status: FriendRequestStatus.REJECTED
  });
}

// Cancel a sent friend request
export async function cancelFriendRequest(requestId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to cancel friend requests');
  }

  // Get the request
  const requestDoc = await getDoc(doc(db, 'friendRequests', requestId));
  if (!requestDoc.exists()) {
    throw new Error('Friend request not found');
  }

  const request = requestDoc.data() as FriendRequest;
  
  // Verify current user is the sender
  if (request.senderId !== auth.currentUser.uid) {
    throw new Error('You can only cancel friend requests you sent');
  }

  // Delete the request
  await deleteDoc(doc(db, 'friendRequests', requestId));
}

// Remove a friend
export async function removeFriend(friendId: string): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('You must be logged in to remove friends');
  }

  // Find the friend entry from current user to friend
  const friendQuery1 = query(
    collection(db, 'friends'),
    where('userId', '==', auth.currentUser.uid),
    where('friendId', '==', friendId)
  );
  
  const snapshot1 = await getDocs(friendQuery1);
  if (!snapshot1.empty) {
    for (const doc of snapshot1.docs) {
      await deleteDoc(doc.ref);
    }
  }

  // Find the friend entry from friend to current user
  const friendQuery2 = query(
    collection(db, 'friends'),
    where('userId', '==', friendId),
    where('friendId', '==', auth.currentUser.uid)
  );
  
  const snapshot2 = await getDocs(friendQuery2);
  if (!snapshot2.empty) {
    for (const doc of snapshot2.docs) {
      await deleteDoc(doc.ref);
    }
  }
}

// Get all friends of the current user
export async function getFriends(): Promise<Friend[]> {
  if (!auth.currentUser) {
    return [];
  }

  const friendsQuery = query(
    collection(db, 'friends'),
    where('userId', '==', auth.currentUser.uid)
  );
  
  const snapshot = await getDocs(friendsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Friend[];
}

// Check if a user is a friend of the current user
export async function checkIsFriend(userId: string): Promise<boolean> {
  if (!auth.currentUser) {
    return false;
  }

  const friendQuery = query(
    collection(db, 'friends'),
    where('userId', '==', auth.currentUser.uid),
    where('friendId', '==', userId)
  );
  
  const snapshot = await getDocs(friendQuery);
  return !snapshot.empty;
}

// Search for users by name
export async function searchUsersByName(searchTerm: string): Promise<UserProfile[]> {
  if (!searchTerm.trim() || !auth.currentUser) {
    return [];
  }

  // Get all users (in a real app, this would need pagination)
  const usersQuery = query(collection(db, 'users'));
  const snapshot = await getDocs(usersQuery);
  
  // Filter out the current user and match the search term
  const searchLower = searchTerm.toLowerCase();
  return snapshot.docs
    .map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile))
    .filter(user => 
      user.uid !== auth.currentUser?.uid && 
      (`${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower) || 
       user.username.toLowerCase().includes(searchLower))
    )
    .slice(0, 10); // Limit to 10 results
} 