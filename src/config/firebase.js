// src/config/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB0rw_vlwzPDs9Td28_xaGp4xdOg1Amw8k",
    authDomain: "internal-issue-reporting-ead17.firebaseapp.com",
    projectId: "internal-issue-reporting-ead17",
    storageBucket: "internal-issue-reporting-ead17.appspot.com",
    messagingSenderId: "495021351206",
    appId: "1:495021351206:web:ffad200afb3651ab9b61e7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
