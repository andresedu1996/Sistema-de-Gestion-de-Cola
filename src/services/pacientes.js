// src/services/pacientes.js
import { db } from "../firebase";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

// Agregar paciente con verificación de expediente único
export async function agregarPaciente(expediente, nombre, fechaNacimiento, edad, sintomas, urgencia) {
  try {
    const ref = doc(db, "pacientes", expediente.toString());
    const snap = await getDoc(ref);

    if (snap.exists()) {
      console.warn("❌ Este número de expediente ya existe:", expediente);
      return { success: false, message: "El expediente ya existe" };
    }

    await setDoc(ref, {
      nombre,
      fechaNacimiento,
      edad,
      sintomas,
      urgencia
    });

    console.log("✅ Paciente agregado:", expediente);
    return { success: true };
  } catch (e) {
    console.error("❌ Error al agregar paciente:", e);
    return { success: false, message: e.message };
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
