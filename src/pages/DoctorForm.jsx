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
  arrayRemove,
  serverTimestamp,
  where,
} from "firebase/firestore";

function AgendarCitaForm() {
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [paciente, setPaciente] = useState(null);

  const [doctores, setDoctores] = useState([]);
  // const [cargandoDoctores, setCargandoDoctores] = useState(true);

  const [form, setForm] = useState({
    fechaHora: "",
    area: "",
    doctorId: "",
    horario: "",
    motivo: "",
    sintomas: "",
    prioridad: "media",
  });

  const [agendando, setAgendando] = useState(false);

  useEffect(() => {
    const cargarDoctores = async () => {
      try {
        const q = query(collection(db, "doctores"));
        const snap = await getDocs(q);
        const rows = await Promise.all(
          snap.docs.map(async (d) => {
            const data = d.data();
            const doctorRef = doc(db, "doctores", d.id);

            if (!data.horariosDisponibles || !data.horariosOcupados) {
              await updateDoc(doctorRef, {
                horariosDisponibles: data.horarios || [],
                horariosOcupados: [],
              });
            }

            return {
              id: d.id,
              nombre: data.nombre,
              area: data.area || data.especialidad || "",
              consultorio: data.consultorio || "",
              horariosDisponibles: data.horariosDisponibles || data.horarios || [],
              horariosOcupados: data.horariosOcupados || [],
            };
          })
        );

        rows.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        setDoctores(rows);
      } catch (err) {
        console.error(err);
        alert("No se pudieron cargar los doctores.");
      } finally {
        // setCargandoDoctores(false);
      }
    };
    cargarDoctores();
  }, []);

  // Áreas únicas
  const areas = useMemo(() => {
    const s = new Set(doctores.map((d) => d.area).filter(Boolean));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [doctores]);

  // Doctores filtrados por área
  const doctoresFiltrados = useMemo(() => {
    if (!form.area) return [];
    return doctores.filter((d) => d.area === form.area);
  }, [doctores, form.area]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "area") {
      setForm((f) => ({ ...f, area: value, doctorId: "", horario: "" }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  //Buscar paciente por expediente o nombre
  const buscarPaciente = async (e) => {
    e?.preventDefault?.();
    if (!busqueda.trim()) {
      alert("Ingresa el número de expediente o nombre");
      return;
    }
    setBuscando(true);
    setNoEncontrado(false);
    setPaciente(null);

    try {
      let q;
      if (/^\d+$/.test(busqueda)) {
        q = doc(db, "pacientes", busqueda.trim());
        const snap = await getDoc(q);
        if (!snap.exists()) {
          setNoEncontrado(true);
          return;
        }
        setPaciente({ id: snap.id, ...snap.data() });
      } else {
        // Buscar por nombre
        const qNombre = query(
          collection(db, "pacientes"),
          // campo "nombre" exacto
          where("nombre", "==", busqueda.trim())
        );
        const snapNombre = await getDocs(qNombre);
        if (snapNombre.empty) {
          setNoEncontrado(true);
          return;
        }
        const data = snapNombre.docs[0].data();
        setPaciente({ id: snapNombre.docs[0].id, ...data });
      }
    } catch (err) {
      console.error(err);
      alert("Error buscando el paciente. Revisa la consola.");
    } finally {
      setBuscando(false);
    }
  };

  //Agendar cita
  const agendarCita = async (e) => {
    e.preventDefault();
    if (!paciente) {
      alert("Primero busca y selecciona un paciente");
      return;
    }
    if (!form.fechaHora || !form.area || !form.doctorId || !form.horario) {
      alert("Completa todos los campos obligatorios");
      return;
    }
    setAgendando(true);
    try {
      const isoFecha = new Date(form.fechaHora).toISOString();
      const selDoctor = doctores.find((d) => d.id === form.doctorId);

      const citaRef = doc(collection(db, "citas"));
      await setDoc(citaRef, {
        pacienteExpediente: paciente.id,
        pacienteNombre: paciente.nombre,
        fechaHora: isoFecha,
        area: form.area,
        doctorId: selDoctor.id,
        doctorNombre: selDoctor.nombre,
        horario: form.horario,
        motivo: form.motivo || "",
        sintomas: form.sintomas || "",
        prioridad: form.prioridad || "media",
        estado: "en_espera",
        createdAt: serverTimestamp(),
      });

      // mover horario a ocupados
      const doctorRef = doc(db, "doctores", selDoctor.id);
      await updateDoc(doctorRef, {
        horariosDisponibles: arrayRemove(form.horario),
        horariosOcupados: arrayUnion(form.horario),
      });

      alert("✅ Cita agendada correctamente");

      setForm({
        fechaHora: "",
        area: "",
        doctorId: "",
        horario: "",
        motivo: "",
        sintomas: "",
        prioridad: "media",
      });
      setPaciente(null);
      setBusqueda("");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al agendar la cita.");
    } finally {
      setAgendando(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "0 auto" }}>
      <h2 className="text-center mb-3">Agendar Cita</h2>

      {/* Búsqueda */}
      <form onSubmit={buscarPaciente} className="mb-4">
        <label className="form-label">Buscar paciente</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Número de expediente o nombre"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" disabled={buscando}>
            {buscando ? "Buscando…" : "Buscar"}
          </button>
        </div>
        {noEncontrado && (
          <div className="text-danger mt-2">Paciente no encontrado.</div>
        )}
      </form>

      {/* Info paciente */}
      {paciente && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-2">Paciente</h5>
            <p className="mb-1"><strong>Expediente:</strong> {paciente.id}</p>
            <p className="mb-1"><strong>Nombre:</strong> {paciente.nombre}</p>
          </div>
        </div>
      )}

      {/* Formulario cita */}
      <form onSubmit={agendarCita}>
        <fieldset disabled={!paciente}>
          <label className="form-label">Fecha y hora</label>
          <input
            type="datetime-local"
            name="fechaHora"
            className="form-control mb-3"
            value={form.fechaHora}
            onChange={handleChange}
            required
          />

          <label className="form-label">Área / Servicio</label>
          <select
            name="area"
            className="form-control mb-3"
            value={form.area}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un área</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <label className="form-label">Doctor</label>
          <select
            name="doctorId"
            className="form-control mb-3"
            value={form.doctorId}
            onChange={handleChange}
            required
            disabled={!form.area}
          >
            <option value="">
              {!form.area ? "Selecciona primero un área" : "Selecciona un doctor"}
            </option>
            {doctoresFiltrados.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre} ({d.consultorio})
              </option>
            ))}
          </select>

          <label className="form-label">Horario disponible</label>
          <select
            name="horario"
            className="form-control mb-3"
            value={form.horario}
            onChange={handleChange}
            required
            disabled={!form.doctorId}
          >
            <option value="">Selecciona un horario</option>
            {doctoresFiltrados
              .find((d) => d.id === form.doctorId)
              ?.horariosDisponibles.map((h, i) => (
                <option key={i} value={h}>{h}</option>
              ))}
          </select>

          <label className="form-label">Síntomas</label>
          <textarea
            name="sintomas"
            className="form-control mb-3"
            rows={2}
            value={form.sintomas}
            onChange={handleChange}
          />

          <label className="form-label">Prioridad</label>
          <select
            name="prioridad"
            className="form-control mb-3"
            value={form.prioridad}
            onChange={handleChange}
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <label className="form-label">Motivo (opcional)</label>
          <textarea
            name="motivo"
            className="form-control mb-4"
            rows={2}
            value={form.motivo}
            onChange={handleChange}
          />

          <button className="btn btn-primary w-100" disabled={agendando}>
            {agendando ? "Agendando…" : "Agendar Cita"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default AgendarCitaForm;
