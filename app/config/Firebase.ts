// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { browserLocalPersistence, getAuth, GoogleAuthProvider, onAuthStateChanged, setPersistence, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ruby-trail.firebaseapp.com",
  projectId: "ruby-trail",
  storageBucket: "ruby-trail.appspot.com",
  messagingSenderId: "597304880673",
  appId: "1:597304880673:web:a8a73b85320bcbbd82bd60",
  measurementId: "G-4NBWKQE4NM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

setPersistence(auth, browserLocalPersistence); // Ensure persistence is set

const signInWithGoogle = () => {
  return signInWithPopup(auth, provider);
};

export { auth, provider, signInWithGoogle, db, onAuthStateChanged, storage };