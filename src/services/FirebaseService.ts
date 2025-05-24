// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQscStnnxjZNCvMft_dVwbPXV4WZhK15k",
  authDomain: "ts-code-68f33.firebaseapp.com",
  projectId: "ts-code-68f33",
  storageBucket: "ts-code-68f33.firebasestorage.app",
  messagingSenderId: "813766241984",
  appId: "1:813766241984:web:d434cfa26c3b4a1e934725",
  measurementId: "G-R4YN5JZPGD",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Firebase Authentication
const firebaseAuth = getAuth(firebaseApp);

// Firebase Database
const firebaseDB = getFirestore(firebaseApp);

// Firebase Storage
const firebaseStorage = getStorage(firebaseApp);

// Firebase Google Provider
const firebaseGoogleProvider = new GoogleAuthProvider();

// Export Firebase services
export {
  firebaseAuth,
  firebaseDB,
  firebaseGoogleProvider,
  firebaseApp,
  firebaseStorage,
};
