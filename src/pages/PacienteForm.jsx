import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

function PacienteForm() {
  // Estado del formulario (sin 'expediente' editable)
  const [paciente, setPaciente] = useState({
    nombre: "",
    fechaNacimiento: "",
    edad: "",
    sintomas: "",
    urgencia: "",
  });

  // Vista previa del siguiente expediente (solo informativo)
  const [nextPreview, setNextPreview] = useState("—");
  const [loading, setLoading] = useState(false);

  // Utilidad para formatear el expediente con ceros a la izquierda
  const formatExp = (n, width = 6) => String(n).padStart(width, "0");

  // Cargar la vista previa del próximo expediente al montar
  useEffect(() => {
    (async () => {
      try {
        const counterRef = doc(db, "counters", "pacientes");
        const snap = await getDoc(counterRef);
        const last = snap.exists() ? snap.data().lastExpediente || 0 : 0;
        setNextPreview(formatExp(last + 1));
      } catch (e) {
        console.warn("No se pudo leer el contador de expedientes:", e);
        setNextPreview("—");
      }
    })();
  }, []);

  const handleChange = (e) => {
    setPaciente({ ...paciente, [e.target.name]: e.target.value });
  };

  const agregarPaciente = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1) Transacción para obtener un expediente único y aumentar el contador
      const expedienteNum = await runTransaction(db, async (tx) => {
        const counterRef = doc(db, "counters", "pacientes");
        const counterSnap = await tx.get(counterRef);

        let last = 0;
        if (counterSnap.exists()) {
          last = counterSnap.data().lastExpediente || 0;
        }
        const next = last + 1;

        tx.set(counterRef, { lastExpediente: next }, { merge: true });
        return next;
      });

      const expediente = formatExp(expedienteNum);

      // 2) Crear el documento del paciente con ID = expediente (único)
      const pacienteDocRef = doc(db, "pacientes", expediente);
      await setDoc(pacienteDocRef, {
        expediente,               // p.ej. "000123"
        expedienteNum,            // número para ordenar fácilmente
        ...paciente,
        createdAt: serverTimestamp(),
      });

      alert(`✅ Paciente agregado. Expediente: ${expediente}`);

      // 3) Reset del formulario y refresco de la vista previa
      setPaciente({
        nombre: "",
        fechaNacimiento: "",
        edad: "",
        sintomas: "",
        urgencia: "",
      });
      setNextPreview(formatExp(expedienteNum + 1));
    } catch (e) {
      console.error("❌ Error:", e);
      alert("Error: revisa la consola");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={agregarPaciente}
      style={{ textAlign: "left", maxWidth: 400, margin: "0 auto" }}
    >
      <h2 className="text-center mb-3">Formulario de Pacientes</h2>

      {/* Mostrar el expediente que se asignará automáticamente */}
      <div className="alert alert-info py-2">
        <strong>Siguiente expediente:</strong>{" "}
        <span className="badge bg-primary">{nextPreview}</span>
      </div>

      {/* El expediente ya NO se edita manualmente */}

      <input
        type="text"
        name="nombre"
        placeholder="Nombre completo"
        className="form-control mb-2"
        value={paciente.nombre}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="fechaNacimiento"
        className="form-control mb-2"
        value={paciente.fechaNacimiento}
        onChange={handleChange}
        required
      />

      <input
        type="number"
        name="edad"
        placeholder="Edad"
        className="form-control mb-2"
        value={paciente.edad}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="sintomas"
        placeholder="Síntomas"
        className="form-control mb-2"
        value={paciente.sintomas}
        onChange={handleChange}
        required
      />

      <select
        name="urgencia"
        className="form-control mb-3"
        value={paciente.urgencia}
        onChange={handleChange}
        required
      >
        <option value="">Nivel de urgencia</option>
        <option value="1">Alta</option>
        <option value="2">Media</option>
        <option value="3">Baja</option>
      </select>

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? "Guardando..." : "Guardar Paciente"}
      </button>
    </form>
  );
}

export default PacienteForm;