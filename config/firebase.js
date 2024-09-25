// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDgn1Vkeo79JQxzsqy6D9NvQv2hcybpgo",
  authDomain: "tcc-app-63be9.firebaseapp.com",
  projectId: "tcc-app-63be9",
  storageBucket: "tcc-app-63be9.appspot.com",
  messagingSenderId: "947931685457",
  appId: "1:947931685457:web:12b8db1f385ef8862e4e70",
  measurementId: "G-9PZDC3D07M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getFirestore(app);
