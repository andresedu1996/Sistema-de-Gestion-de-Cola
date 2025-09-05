// src/services/pacientes.js
import { db } from "../firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

// Agregar paciente
export async function agregarPaciente(expediente, nombre, fechaNacimiento, edad, sintomas, urgencia) {
  try {
    await setDoc(doc(db, "pacientes", expediente.toString()), {
      nombre,
      fechaNacimiento,
      edad,
      sintomas,
      urgencia
    });
    console.log("✅ Paciente agregado:", expediente);
  } catch (e) {
    console.error("❌ Error al agregar paciente:", e);
  }
}

// Obtener un paciente
export async function obtenerPaciente(expediente) {
  const ref = doc(db, "pacientes", expediente.toString());
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return snap.data();
  } else {
    console.log("⚠️ No se encontró el paciente");
    return null;
  }
}

// Listar todos los pacientes
export async function listarPacientes() {
  const querySnapshot = await getDocs(collection(db, "pacientes"));
  let pacientes = [];
  querySnapshot.forEach((doc) => {
    pacientes.push({ id: doc.id, ...doc.data() });
  });
  return pacientes;
}
