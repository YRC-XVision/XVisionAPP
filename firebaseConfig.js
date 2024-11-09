// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';  // Import Firestore

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDRrsc2qrFTdur-876iZt9k_s6Ux6obABQ",
    authDomain: "xvision-e6469.firebaseapp.com",
    projectId: "xvision-e6469",
    storageBucket: "xvision-e6469.firebasestorage.app",
    messagingSenderId: "414631673394",
    appId: "1:414631673394:web:0078f918d111a605f7862b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);
const auth = getAuth(app);  // Initialize Firebase Auth
const firestore = getFirestore(app);  // Initialize Firestore

// Export initialized services for use in other files
export { storage, auth, firestore };

export default { app };