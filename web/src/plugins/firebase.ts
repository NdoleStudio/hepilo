import { initializeApp } from "firebase/app";
import { getAuth, User, Auth } from "firebase/auth";
import { User as StateUser } from "@/store/index";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import splitbee from "@/plugins/splitbee";
import store from "@/store";

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
          email: user?.uid,
        });
      }

      let stateUser: StateUser | null = null;
      if (user) {
        stateUser = {
          id: user.uid,
          name: user.displayName,
          photoURL: user.photoURL,
        };
      }
      store.dispatch("setUser", stateUser).finally(() => {
        resolve(user);
      });
    }, reject);
  });
};

initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(
    process.env.VUE_APP_RECAPTCHA_SITE_KEY as string
  ),

  // Optional argument. If true, the SDK automatically refreshes App Check
  // tokens as needed.
  isTokenAutoRefreshEnabled: true,
});

export const getFirebaseAuth = (): Auth => getAuth(app);

export default app;
