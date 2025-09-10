// src/pages/AgendarCitaForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  where,
} from "firebase/firestore";

function AgendarCitaForm() {
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [noEncontrado, setNoEncontrado] = useState(false);

  const [doctores, setDoctores] = useState([]);
  const [cargandoDoctores, setCargandoDoctores] = useState(true);

  const [form, setForm] = useState({
    area: "",
    doctorId: "",
    fecha: "",
    horario: "",
    sintomas: "",
    motivo: "",
    prioridad: "media",
  });

  const [agendando, setAgendando] = useState(false);

  // 🔹 Cargar todos los doctores al inicio
  useEffect(() => {
    const cargarDoctores = async () => {
      try {
        const q = query(collection(db, "doctores"));
        const snap = await getDocs(q);
        const rows = snap.docs.map(d => ({
          id: d.id,
          ...d.data(),
          horariosDisponibles: d.data().horarios || [],
          horariosOcupados: d.data().horariosOcupados || [],
        }));
        rows.sort((a, b) => String(a.nombre || "").localeCompare(String(b.nombre || "")));
        setDoctores(rows);
      } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los doctores.");
      } finally {
        setCargandoDoctores(false);
      }
    };
    cargarDoctores();
  }, []);

  // 🔹 Áreas únicas
  const areas = useMemo(() => {
    const s = new Set(doctores.map(d => (d.area || "").trim()).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [doctores]);

  // 🔹 Doctores filtrados por área seleccionada
  const doctoresFiltrados = useMemo(() => {
    if (!form.area) return [];
    return doctores.filter(d => (d.area || "").trim() === form.area);
  }, [doctores, form.area]);

  // 🔹 Bloques disponibles según doctor y fecha
  const horariosDisponiblesDelDoctor = useMemo(() => {
    if (!form.doctorId || !form.fecha) return [];
    const selDoctor = doctores.find(d => d.id === form.doctorId);
    if (!selDoctor) return [];

    const fechaSeleccionada = form.fecha; // formato yyyy-mm-dd

    return (selDoctor.horarios || []).filter(h => {
      return !(selDoctor.horariosOcupados || []).some(
        o => o.fecha === fechaSeleccionada && o.horario === h
      );
    });
  }, [form.doctorId, form.fecha, doctores]);

  // 🔹 Manejo de cambios en el formulario
  const handleChange = e => {
    const { name, value } = e.target;
    if (name === "area") {
      setForm(f => ({ ...f, area: value, doctorId: "", horario: "" }));
      return;
    }
    if (name === "doctorId") {
      setForm(f => ({ ...f, doctorId: value, horario: "" }));
      return;
    }
    setForm(f => ({ ...f, [name]: value }));
  };

  // 🔹 Buscar paciente por expediente o nombre
  const buscarPaciente = async () => {
    if (!busqueda.trim()) return alert("Ingrese expediente o nombre");
    setBuscando(true);
    setPaciente(null);
    setNoEncontrado(false);

    try {
      let q;
      if (/^\d+$/.test(busqueda.trim())) {
        // por expediente
        q = query(collection(db, "pacientes"), where("expediente", "==", busqueda.trim()));
      } else {
        // por nombre exacto
        q = query(collection(db, "pacientes"), where("nombre", "==", busqueda.trim()));
      }
      const snap = await getDocs(q);
      if (!snap.empty) {
        setPaciente({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setNoEncontrado(true);
      }
    } catch (err) {
      console.error(err);
      alert("Error buscando paciente");
    } finally {
      setBuscando(false);
    }
  };

// 🔹 Agendar cita
const agendarCita = async e => {
  e.preventDefault();
  if (!paciente) return alert("Primero busca un paciente");
  if (!form.area || !form.doctorId || !form.fecha || !form.horario)
    return alert("Completa todos los campos requeridos");

  setAgendando(true);
  try {
    const selDoctor = doctores.find(d => d.id === form.doctorId);
    const doctorRef = doc(db, "doctores", selDoctor.id);

    // Crear cita
    const citaRef = doc(collection(db, "citas"));
    await setDoc(citaRef, {
      pacienteId: paciente.id,
      pacienteNombre: paciente.nombre,
      area: form.area,
      doctorId: selDoctor.id,
      doctorNombre: selDoctor.nombre,
      fecha: form.fecha,
      horario: form.horario,
      sintomas: form.sintomas,
      motivo: form.motivo,
      prioridad: form.prioridad,
      estado: "en_espera", // ⚡ la cita queda en espera
      createdAt: serverTimestamp(),
    });

    // Marcar horario como ocupado
    await updateDoc(doctorRef, {
      horariosOcupados: arrayUnion({
        fecha: form.fecha,
        horario: form.horario,
      }),
    });

    // ⚡ Actualizar paciente: marcar en lista de espera
    const pacRef = doc(db, "pacientes", paciente.id);
    await updateDoc(pacRef, {
      enEspera: true,
      ultimaCitaId: citaRef.id,
      ultimaCitaFecha: form.fecha,
    });

    alert("✅ Cita agendada y paciente enviado a lista de espera");

    // Reset formulario
    setForm({
      area: "",
      doctorId: "",
      fecha: "",
      horario: "",
      sintomas: "",
      motivo: "",
      prioridad: "media",
    });
    setPaciente(null);
    setBusqueda("");
  } catch (err) {
    console.error(err);
    alert("Error al agendar cita");
  } finally {
    setAgendando(false);
  }
};


  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 className="text-center mb-3">Agendar Cita</h2>

      {/* Búsqueda */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Expediente o nombre"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={buscarPaciente} disabled={buscando}>
          {buscando ? "Buscando…" : "Buscar"}
        </button>
      </div>
      {noEncontrado && <div className="text-danger mb-2">Paciente no encontrado</div>}

      {/* Info paciente */}
      {paciente && (
        <div className="card mb-3">
          <div className="card-body">
            <p><strong>Expediente:</strong> {paciente.expediente}</p>
            <p><strong>Nombre:</strong> {paciente.nombre}</p>
            {paciente.edad && <p><strong>Edad:</strong> {paciente.edad}</p>}
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={agendarCita}>
        <fieldset disabled={!paciente}>
          {/* Área */}
          <label className="form-label">Área</label>
          <select name="area" className="form-control mb-2" value={form.area} onChange={handleChange}>
            <option value="">Seleccione área</option>
            {areas.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Doctor */}
          <label className="form-label">Doctor</label>
          <select name="doctorId" className="form-control mb-2" value={form.doctorId} onChange={handleChange} disabled={!form.area}>
            <option value="">Seleccione doctor</option>
            {doctoresFiltrados.map(d => (
              <option key={d.id} value={d.id}>{d.nombre}</option>
            ))}
          </select>

          {/* Fecha */}
          <label className="form-label">Fecha</label>
          <input type="date" name="fecha" className="form-control mb-2" value={form.fecha} onChange={handleChange} disabled={!form.doctorId} />

          {/* Horario */}
          <label className="form-label">Horario disponible</label>
          <select name="horario" className="form-control mb-2" value={form.horario} onChange={handleChange} disabled={!form.fecha}>
            <option value="">Seleccione horario</option>
            {horariosDisponiblesDelDoctor.map((h, i) => (
              <option key={i} value={h}>{h}</option>
            ))}
          </select>

          {/* Síntomas */}
          <label className="form-label">Síntomas</label>
          <textarea name="sintomas" className="form-control mb-2" rows={2} value={form.sintomas} onChange={handleChange} />

          {/* Motivo */}
          <label className="form-label">Motivo</label>
          <textarea name="motivo" className="form-control mb-2" rows={2} value={form.motivo} onChange={handleChange} />

          {/* Prioridad */}
          <label className="form-label">Prioridad</label>
          <select name="prioridad" className="form-control mb-3" value={form.prioridad} onChange={handleChange}>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <button type="submit" className="btn btn-primary w-100" disabled={agendando}>
            {agendando ? "Agendando…" : "Agendar Cita"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default AgendarCitaForm;
