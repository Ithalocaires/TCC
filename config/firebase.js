import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBDgn1Vkeo79JQxzsqy6D9NvQv2hcybpgo",
  authDomain: "tcc-app-63be9.firebaseapp.com",
  projectId: "tcc-app-63be9",
  storageBucket: "tcc-app-63be9.appspot.com",
  messagingSenderId: "947931685457",
  appId: "1:947931685457:web:12b8db1f385ef8862e4e70",
  measurementId: "G-9PZDC3D07M"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicialize a autenticação com persistência usando AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Obtenha o serviço de Firestore
const database = getFirestore(app);

export { auth, database };

