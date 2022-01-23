import { initializeApp } from "firebase/app";
import { getAuth, User, Auth } from "firebase/auth";
import splitbee from "@/plugins/splitbee";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoeOz6cobux6wPOw7XzBJ8wxywjeawpX0",
  authDomain: "hepilo-f5cd4.firebaseapp.com",
  projectId: "hepilo-f5cd4",
  storageBucket: "hepilo-f5cd4.appspot.com",
  messagingSenderId: "188406853589",
  appId: "1:188406853589:web:44027cc012b25de293175c",
  measurementId: "G-20SNSQ62TF",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = getFirebaseAuth().onAuthStateChanged((user) => {
      unsubscribe();
      if (user) {
        splitbee.user.set({
          email: user?.email,
        });
      }
      resolve(user);
    }, reject);
  });
};

export const getFirebaseAuth = (): Auth => getAuth(app);

export default app;
