const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('NetZero Firebase Rules Deployment Script');
console.log('========================================');

// Check if firebase-tools is installed
try {
  console.log('Checking for Firebase CLI...');
  execSync('firebase --version', { stdio: 'pipe' });
  console.log('✅ Firebase CLI is installed');
} catch (error) {
  console.log('❌ Firebase CLI not found, installing...');
  try {
    execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    console.log('✅ Firebase CLI installed successfully');
  } catch (installError) {
    console.error('Error installing Firebase CLI:', installError.message);
    console.log('Please install Firebase CLI manually: npm install -g firebase-tools');
    process.exit(1);
  }
}

// Path to the Firestore rules file
const rulesPath = path.join(__dirname, 'firestore.rules');

console.log('Deploying Firestore rules...');

try {
  // Check if the rules file exists
  if (!fs.existsSync(rulesPath)) {
    console.error('Error: firestore.rules file not found!');
    process.exit(1);
  }

  // Deploy the rules using Firebase CLI
  execSync('firebase deploy --only firestore:rules', { stdio: 'inherit' });
  
  console.log('\nFirestore rules deployed successfully!');
} catch (error) {
  console.error('Error deploying Firestore rules:', error.message);
  
  console.log('\nIf you encounter authentication issues, you can manually deploy the rules via the Firebase Console:');
  console.log('1. Go to https://console.firebase.google.com/');
  console.log('2. Select your project');
  console.log('3. Navigate to Firestore Database');
  console.log('4. Click on the "Rules" tab');
  console.log('5. Paste the content of your firestore.rules file');
  console.log('6. Click "Publish"');
  
  process.exit(1);
} 