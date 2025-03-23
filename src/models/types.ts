// Add Friend-related types
export interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string | null;
  receiverId: string;
  receiverName: string;
  receiverPhotoURL?: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: any; // Firestore timestamp
}

export interface Friend {
  id: string;
  userId: string;
  friendId: string;
  friendName: string;
  friendPhotoURL?: string | null;
  addedAt: any; // Firestore timestamp
}

export enum FriendRequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
} 