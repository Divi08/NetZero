# Community Chat Feature

## Overview
The Community Chat feature allows verified users to participate in public discussions about specific environmental cases. This feature creates a forum similar to Reddit or Discord where users can share information, evidence, and opinions about each case.

## Implementation Details

### Firebase Structure
For each case, a separate collection in Firestore is created under the path:
```
case_community_chats/{caseId}/messages/


```

This structure allows:
- Each case to have its own isolated discussion space
- All verified users to have access to view and contribute to discussions
- Messages to be stored with user information and timestamps

### Security Rules
The Firebase security rules have been configured to:
- Allow any authenticated user to read case community chats
- Allow any authenticated user to write messages to case community chats
- Protect message data from unauthenticated access

```
// Firebase security rules for community chats
match /case_community_chats/{caseId} {
  allow read: if request.auth != null;
  allow create, update: if request.auth != null;
  
  // Allow all authenticated users to read and write messages in community chats
  match /messages/{messageId} {
    allow read, write: if request.auth != null;
  }
}
```

### User Interface
- The community chat is accessed through the "Community Discussion" tab on the case detail page
- Messages are displayed in a chat interface similar to common messaging applications
- User avatars and names are displayed to identify message senders
- Messages are automatically refreshed to show new contributions
- Timestamps show when messages were sent

### Message Format
Each message contains:
- Content: The text of the message
- UserID: The Firebase auth ID of the sender
- UserName: The display name of the sender
- UserPhotoURL: The profile photo URL of the sender (if available)
- Timestamp: When the message was sent

## How It Works
1. When a user navigates to a case detail page, the community chat component is loaded
2. The component queries Firestore for existing messages for that specific case
3. Messages are displayed in chronological order
4. Users can type and send new messages, which are immediately added to the Firebase database
5. The message list automatically refreshes to show new messages from other users
6. All user information is pulled from the authenticated user's profile

## Future Enhancements
- Message editing and deletion
- Media attachment support
- Message reactions
- Threading/replying to specific messages
- Notifications for new messages 