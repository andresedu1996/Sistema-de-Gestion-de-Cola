
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyCjVH_5a59d_kewT3-HD0ptSmJPeyrmnmM",
  authDomain: "gestion-pacientes-2194a.firebaseapp.com",
  projectId: "gestion-pacientes-2194a",
  storageBucket: "gestion-pacientes-2194a.firebasestorage.app",
  messagingSenderId: "148156220633",
  appId: "1:148156220633:web:2c129f6bd15c03645aeac8",
  measurementId: "G-Q6EKRMDRBE"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
