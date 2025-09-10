// Este arhcivo se puede eliminar despues es solo para crear una lista rapida.

// seedDoctores.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";
import 'dotenv/config';

// ⚡ Reemplaza con tu configuración real de Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// =============================
// Datos de Doctores de ejemplo
// =============================
const horariosDiurnos = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

const horariosNocturnos = [
  "19:00 - 20:00",
  "20:00 - 21:00",
  "21:00 - 22:00",
  "22:00 - 23:00",
  "23:00 - 00:00",
  "00:00 - 01:00",
  "01:00 - 02:00",
  "02:00 - 03:00",
];

const areas = [
  "Cardiología",
  "Pediatría",
  "Dermatología",
  "Ginecología",
  "Neurología",
  "Traumatología",
  "Medicina Interna",
  "Odontología",
  "Oftalmología",
  "Consulta General",
];

const doctores = Array.from({ length: 20 }, (_, i) => {
  const id = `dp-${(i + 1).toString().padStart(3, "0")}`;
  const esNocturno = i >= 15; // últimos 5 serán nocturnos
  const area =
    esNocturno && i % 2 === 0 ? "Consulta General" : areas[i % areas.length];

  return {
    id,
    nombre: `Doctor ${i + 1}`,
    area,
    telefono: `9999-${(1000 + i).toString()}`,
    edificio: i % 2 === 0 ? "Torre A" : "Torre B",
    consultorio: `${i % 2 === 0 ? "A" : "B"}-${100 + i}`,
    foto: "default.png",
    horarios: esNocturno ? horariosNocturnos : horariosDiurnos,
  };
});

// =============================
// Subir a Firestore
// =============================
async function seed() {
  try {
    for (const doctor of doctores) {
      await setDoc(doc(collection(db, "doctores"), doctor.id), doctor);
      console.log(`✅ Subido ${doctor.nombre} (${doctor.area})`);
    }
    console.log("🎉 Seed completado con éxito.");
  } catch (err) {
    console.error("❌ Error subiendo doctores:", err);
  }
}

seed();
