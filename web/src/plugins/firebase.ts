// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
