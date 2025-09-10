// src/pages/Citas.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  serverTimestamp,
} from "firebase/firestore";

function Citas() {
  const [busqueda, setBusqueda] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [doctores, setDoctores] = useState([]);
  const [area, setArea] = useState("");
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔹 Buscar paciente
  const buscarPaciente = async () => {
    if (!busqueda.trim()) return alert("Ingrese expediente o nombre");

    try {
      let q;
      if (/^\d+$/.test(busqueda)) {
        q = query(collection(db, "pacientes"), where("expediente", "==", busqueda));
      } else {
        q = query(collection(db, "pacientes"), where("nombre", "==", busqueda));
      }

      const snap = await getDocs(q);
      if (!snap.empty) {
        setPaciente(snap.docs[0].data());
      } else {
        alert("Paciente no encontrado");
        setPaciente(null);
      }
    } catch (e) {
      console.error("❌ Error buscando paciente:", e);
    }
  };

  // 🔹 Cargar doctores según área
  const cargarDoctores = async (areaFiltro) => {
    try {
      const q = query(collection(db, "doctores"), where("area", "==", areaFiltro));
      const snap = await getDocs(q);

      const docsData = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          const doctorRef = doc(db, "doctores", d.id);

          // Si no existen horariosDisponibles u ocupados, inicializarlos
          if (!data.horariosDisponibles || !data.horariosOcupados) {
            await updateDoc(doctorRef, {
              horariosDisponibles: data.horarios || [],
              horariosOcupados: [],
            });
          }

          return {
            ...data,
            id: d.id,
            horariosDisponibles: data.horariosDisponibles || data.horarios || [],
            horariosOcupados: data.horariosOcupados || [],
          };
        })
      );

      setDoctores(docsData);
    } catch (e) {
      console.error("❌ Error cargando doctores:", e);
    }
  };

  // 🔹 Guardar cita
  const guardarCita = async (e) => {
    e.preventDefault();
    if (!paciente || !doctorSeleccionado || !horarioSeleccionado) {
      return alert("Faltan datos");
    }

    setLoading(true);
    try {
      const citaId = `${paciente.expediente}-${doctorSeleccionado.id}-${horarioSeleccionado}`;
      const citaRef = doc(db, "citas", citaId);
      const doctorRef = doc(db, "doctores", doctorSeleccionado.id);

      // Guardar la cita
      await setDoc(citaRef, {
        paciente: {
          expediente: paciente.expediente,
          nombre: paciente.nombre,
          sintomas: paciente.sintomas,
          urgencia: paciente.urgencia,
        },
        doctor: {
          id: doctorSeleccionado.id,
          nombre: doctorSeleccionado.nombre,
          area: doctorSeleccionado.area,
        },
        horario: horarioSeleccionado,
        createdAt: serverTimestamp(),
      });

      // Mover horario de disponibles a ocupados
      await updateDoc(doctorRef, {
        horariosDisponibles: arrayRemove(horarioSeleccionado),
        horariosOcupados: arrayUnion(horarioSeleccionado),
      });

      alert("✅ Cita guardada correctamente");
      setDoctorSeleccionado(null);
      setHorarioSeleccionado("");
      setArea("");
      setDoctores([]);
    } catch (e) {
      console.error("❌ Error guardando cita:", e);
      alert("Error: revisa la consola");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Liberar un horario (para cancelar o re-agendar)
  const liberarHorario = async (doctorId, horario) => {
    const doctorRef = doc(db, "doctores", doctorId);
    try {
      await updateDoc(doctorRef, {
        horariosDisponibles: arrayUnion(horario),
        horariosOcupados: arrayRemove(horario),
      });
      alert(`Horario ${horario} liberado correctamente`);
    } catch (e) {
      console.error("❌ Error liberando horario:", e);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto" }}>
      <h2 className="text-center mb-3">Asignar Cita</h2>

      {/* Buscar paciente */}
      <div className="input-group mb-3">
        <input
          type="text"
          placeholder="Expediente o nombre"
          className="form-control"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={buscarPaciente}>
          Buscar
        </button>
      </div>

      {paciente && (
        <div className="alert alert-info">
          <strong>Paciente:</strong> {paciente.nombre} <br />
          <strong>Expediente:</strong> {paciente.expediente} <br />
          <strong>Síntomas:</strong> {paciente.sintomas} <br />
          <strong>Urgencia:</strong>{" "}
          {paciente.urgencia === "1"
            ? "Alta"
            : paciente.urgencia === "2"
            ? "Media"
            : "Baja"}
        </div>
      )}

      {/* Seleccionar área */}
      <select
        className="form-control mb-3"
        value={area}
        onChange={(e) => {
          setArea(e.target.value);
          cargarDoctores(e.target.value);
        }}
      >
        <option value="">Seleccione área</option>
        <option value="Consulta General">Consulta General</option>
        <option value="Cardiología">Cardiología</option>
        <option value="Pediatría">Pediatría</option>
        <option value="Dermatología">Dermatología</option>
        <option value="Ginecología">Ginecología</option>
        <option value="Neurología">Neurología</option>
        <option value="Traumatología">Traumatología</option>
        <option value="Medicina Interna">Medicina Interna</option>
        <option value="Odontología">Odontología</option>
        <option value="Oftalmología">Oftalmología</option>
      </select>

      {/* Seleccionar doctor */}
      {doctores.length > 0 && (
        <select
          className="form-control mb-3"
          value={doctorSeleccionado?.id || ""}
          onChange={(e) =>
            setDoctorSeleccionado(
              doctores.find((d) => d.id === e.target.value) || null
            )
          }
        >
          <option value="">Seleccione doctor</option>
          {doctores.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre} ({d.consultorio})
            </option>
          ))}
        </select>
      )}

      {/* Seleccionar horario */}
      {doctorSeleccionado && doctorSeleccionado.horariosDisponibles?.length > 0 && (
        <select
          className="form-control mb-3"
          value={horarioSeleccionado}
          onChange={(e) => setHorarioSeleccionado(e.target.value)}
        >
          <option value="">Seleccione horario</option>
          {doctorSeleccionado.horariosDisponibles.map((h, i) => (
            <option key={i} value={h}>
              {h}
            </option>
          ))}
        </select>
      )}

      <button
        className="btn btn-primary w-100"
        onClick={guardarCita}
        disabled={loading}
      >
        {loading ? "Guardando..." : "Asignar Cita"}
      </button>
    </div>
  );
}

export default Citas;
