// This script helps deploy Firestore rules using the Firebase Admin SDK
// You need to run this with Node.js

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔥 Firebase Firestore Rules Deployment Script 🔥');
console.log('----------------------------------------------');

// Check if firebase-tools is installed
console.log('1. Checking if firebase-tools is installed...');

exec('firebase --version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Firebase CLI not found. Installing firebase-tools...');
    exec('npm install -g firebase-tools', (installError, installStdout, installStderr) => {
      if (installError) {
        console.error('❌ Failed to install Firebase CLI:', installError);
        console.log('Please install Firebase CLI manually: npm install -g firebase-tools');
        process.exit(1);
      }
      console.log('✅ Firebase CLI installed successfully');
      console.log('Please run this script again after installation.');
      process.exit(0);
    });
  } else {
    console.log(`✅ Firebase CLI found: ${stdout.trim()}`);
    proceedWithDeployment();
  }
});

function proceedWithDeployment() {
  console.log('2. Checking if firestore.rules file exists...');
  
  const rulesPath = path.join(__dirname, 'firestore.rules');
  
  if (!fs.existsSync(rulesPath)) {
    console.error('❌ firestore.rules file not found');
    process.exit(1);
  }
  
  console.log('✅ firestore.rules file exists');
  
  // Attempt to deploy the rules
  console.log('3. Deploying Firestore rules...');
  console.log('Running: firebase deploy --only firestore:rules');
  
  exec('firebase deploy --only firestore:rules', (deployError, stdout, stderr) => {
    if (deployError) {
      console.error('❌ Failed to deploy Firestore rules:', deployError);
      
      if (stderr.includes('not authorized') || stderr.includes('permission')) {
        console.log('You might need to login to Firebase first. Run: firebase login');
      } else if (stderr.includes('project')) {
        console.log('You might need to select a Firebase project first. Run: firebase use --add');
      }
      
      process.exit(1);
    }
    
    console.log(stdout);
    console.log('✅ Firestore rules deployed successfully');
    
    // Optional: Print out the rules content for confirmation
    console.log('4. Deployed Firestore rules:');
    const rules = fs.readFileSync(rulesPath, 'utf8');
    console.log('---');
    console.log(rules);
    console.log('---');
    
    console.log('🎉 Deployment complete! Your friend system should now work properly.');
  });
} 