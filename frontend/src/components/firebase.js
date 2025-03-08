

// Import Firebase modules using the modular syntax
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDd4HKRIF91LcZTQYFbndN8fnqSdEpyibE",
    authDomain: "plantai-1bbdc.firebaseapp.com",
    projectId: "plantai-1bbdc",
    storageBucket: "plantai-1bbdc.firebasestorage.app",
    messagingSenderId: "876734848580",
    appId: "1:876734848580:web:b9135de4f261fe4d7ce611",
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);

// Export the services
export { auth, firestore };