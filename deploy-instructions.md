# Deploy Firebase Security Rules

To fix the "Missing or insufficient permissions" errors, you need to deploy the Firestore security rules we created. Follow these steps:

## Prerequisites
- Make sure you have the Firebase CLI installed. If not, install it using:
  ```
  npm install -g firebase-tools
  ```

## Steps to Deploy Rules
1. Login to Firebase:
   ```
   firebase login
   ```

2. Initialize Firebase in your project (if not already done):
   ```
   firebase init
   ```
   - Select "Firestore" when prompted for features
   - Choose your existing Firebase project
   - Accept the default file locations

3. Deploy your Firestore security rules:
   ```
   firebase deploy --only firestore:rules
   ```

## Alternative: Deploy Rules Using Firebase Console
If you prefer using the Firebase Console:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project "netzero-2e557"
3. Navigate to Firestore Database in the left sidebar
4. Click on the "Rules" tab
5. Paste the following rules:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read other user profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read and write to their chats
    match /chats/{chatId} {
      allow create: if request.auth != null &&
                    request.auth.uid in request.resource.data.participants;
      allow read, update, delete: if request.auth != null && 
                                  request.auth.uid in resource.data.participants;
      
      // Allow messages in chats
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
                           exists(/databases/$(database)/documents/chats/$(chatId)) &&
                           request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
      }
    }
  }
}
```

6. Click "Publish" to deploy the rules

## Expected Outcome
After deploying these rules, authenticated users will be able to:
- Read any user profile
- Update their own user profile
- Create chats where they are a participant
- Read and send messages in chats where they are a participant

This should fix the permission denied errors you're experiencing. 