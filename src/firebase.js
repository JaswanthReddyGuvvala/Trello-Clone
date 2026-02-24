import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {

  apiKey: "AIzaSyAI3kbFe-4pwm1i49jJG-ctlZsFv9y7EKA",

  authDomain: "trello-clone-20cc8.firebaseapp.com",

  projectId: "trello-clone-20cc8",

  storageBucket: "trello-clone-20cc8.firebasestorage.app",

  messagingSenderId: "337838243196",

  appId: "1:337838243196:web:a460069b071936603a78f9"

};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();