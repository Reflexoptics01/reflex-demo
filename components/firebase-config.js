import { initializeApp } from "firebase/app";
import{getFirestore} from "@firebase/firestore"
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyAfsiT_0KoqBghS00b0_HuTivOFhr454Ho",
  authDomain: "refles-optics-demo.firebaseapp.com",
  projectId: "refles-optics-demo",
  storageBucket: "refles-optics-demo.firebasestorage.app",
  messagingSenderId: "696562114393",
  appId: "1:696562114393:web:eda3d5ea3bd73937ee7648",
  measurementId: "G-GNTBQC2ZPN"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db=getFirestore(app);
export const auth =getAuth();
export const storage=getStorage(app);
