# NetZero Application Features

## Core Features

### 1. Chat System
The chat system allows users to communicate privately with each other. This feature includes:
- Viewing a list of existing chats
- Creating new conversations with other users
- Real-time message sending and receiving
- Unread message indicators
- Timestamp display for messages

### 2. Community Discussion
Each environmental policy case includes a community discussion section where:
- All authenticated users can view and participate in discussions
- Users can share thoughts and insights about specific cases
- The @zero bot can be mentioned to get AI assistance
- Messages appear in real-time with user avatars and timestamps

### 3. Friend System
The friend system enables social connections between users:
- Searching for other users by name or username
- Sending, receiving, accepting, and rejecting friend requests
- Viewing lists of friends, incoming requests, and outgoing requests
- Removing existing friends

### 4. Case System
The environmental policy case system includes:
- Browsing available cases
- Viewing detailed case information
- AI analysis generation for cases
- Case history tracking
- Facility information display

### 5. User Profiles
Users can manage their profiles with features for:
- Viewing and editing profile information
- Uploading profile pictures
- Viewing user activity history

## Additional Features

- **Dashboard**: Overview of recent activity and important information
- **History Tracking**: Record of case interactions
- **News Section**: Updates and articles related to environmental policies
- **Settings**: Application configuration options

## Getting Started

1. Run the application with `npm run dev`
2. Deploy the Firestore rules using the instructions in `MANUAL_DEPLOY.md`
3. The Chat feature is accessible from the sidebar
4. Community Discussion is available in each Case Detail page
5. Friend management is available in the Friends page

## Firestore Security Rules

The application uses Firestore security rules to protect data while allowing appropriate access:
- User profile data is protected but readable by authenticated users
- Chat messages are only accessible to conversation participants
- Friend data is limited to the user who owns the relationship
- Community discussions are accessible to all authenticated users
- Case data is publicly readable

For complete details on permissions, please review the `MANUAL_DEPLOY.md` file. 