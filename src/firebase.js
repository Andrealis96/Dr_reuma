import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyApDHEhJ-Or27pDw3uwqvaTFeaDkhpB_w4",
    authDomain: "dr-reuma-web.firebaseapp.com",
    projectId: "dr-reuma-web",
    storageBucket: "dr-reuma-web.firebasestorage.app",
    messagingSenderId: "764909923888",
    appId: "1:764909923888:web:60658fbbdb072845fe87f5"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
