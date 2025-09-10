import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

function AgendarCitaForm() {
  const [expediente, setExpediente] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [paciente, setPaciente] = useState(null);

  // --- Doctores ---
  const [doctores, setDoctores] = useState([]);
  const [cargandoDoctores, setCargandoDoctores] = useState(true);

  const [form, setForm] = useState({
    fechaHora: "",
    area: "",         // 👈 NUEVO: área/servicio al que va
    doctorId: "",
    motivo: "",
    sintomas: "",
    prioridad: "media", // alta | media | baja
  });

  const [agendando, setAgendando] = useState(false);

  // Cargar doctores para el select y deducir áreas disponibles
  useEffect(() => {
    const cargarDoctores = async () => {
      try {
        const q = query(collection(db, "doctores"));
        const snap = await getDocs(q);
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // ordena por nombre si existe
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

  // Áreas únicas (usa d.area; si no hay, cae a d.especialidad)
  const areas = useMemo(() => {
    const s = new Set(
      doctores
        .map((d) => (d.area || d.especialidad || "").trim())
        .filter(Boolean)
    );
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [doctores]);

  // Doctores filtrados por área seleccionada
  const doctoresFiltrados = useMemo(() => {
    if (!form.area) return [];
    return doctores.filter((d) => {
      const areaDoc = (d.area || d.especialidad || "").trim();
      return areaDoc === form.area;
    });
  }, [doctores, form.area]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // si cambia el área, resetea el doctor seleccionado
    if (name === "area") {
      setForm((f) => ({ ...f, area: value, doctorId: "" }));
      return;
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  const buscarPaciente = async (e) => {
    e?.preventDefault?.();
    if (!expediente.trim()) {
      alert("Ingresa el número de expediente");
      return;
    }
    setBuscando(true);
    setNoEncontrado(false);
    setPaciente(null);
    try {
      const pacRef = doc(db, "pacientes", expediente.trim());
      const snap = await getDoc(pacRef);
      if (!snap.exists()) {
        setNoEncontrado(true);
        return;
      }
      setPaciente({ id: snap.id, ...snap.data() });
    } catch (err) {
      console.error(err);
      alert("Error buscando el expediente. Revisa la consola.");
    } finally {
      setBuscando(false);
    }
  };

  const agendarCita = async (e) => {
    e.preventDefault();
    if (!paciente) {
      alert("Primero busca y selecciona un paciente");
      return;
    }
    if (!form.fechaHora || !form.area || !form.doctorId) {
      alert("Completa la fecha/hora, el área y el doctor");
      return;
    }
    setAgendando(true);
    try {
      const isoFecha = new Date(form.fechaHora).toISOString();

      // Doctor seleccionado
      const selDoctor = doctoresFiltrados.find((d) => d.id === form.doctorId)
        || doctores.find((d) => d.id === form.doctorId);
      const doctorNombre = selDoctor?.nombre || "";
      const doctorEspecialidad = selDoctor?.especialidad || "";
      const areaSeleccionada = form.area;

      // crea cita con ID autogenerado
      const citaRef = doc(collection(db, "citas"));
      await setDoc(citaRef, {
        pacienteExpediente: paciente.id,
        pacienteNombre: paciente.nombre ?? "",
        fechaHora: isoFecha,
        area: areaSeleccionada,     // 👈 guardamos el área
        doctorId: form.doctorId,
        doctorNombre,               // útil para reportes
        doctorEspecialidad,         // opcional
        motivo: form.motivo || "",
        sintomas: form.sintomas || "",
        prioridad: form.prioridad || "media",
        estado: "en_espera",
        createdAt: serverTimestamp(),
      });

      // marca paciente en espera y guarda última cita
      const pacRef = doc(db, "pacientes", paciente.id);
      await updateDoc(pacRef, {
        enEspera: true,
        ultimaCitaId: citaRef.id,
        ultimaCitaFecha: isoFecha,
      });

      alert("✅ Cita agendada y paciente enviado a lista de espera");

      // limpia
      setForm({
        fechaHora: "",
        area: "",
        doctorId: "",
        motivo: "",
        sintomas: "",
        prioridad: "media",
      });
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al agendar la cita. Revisa la consola.");
    } finally {
      setAgendando(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h2 className="text-center mb-3">Agendar Cita</h2>

      {/* Búsqueda por expediente */}
      <form onSubmit={buscarPaciente} className="mb-4">
        <label className="form-label">Buscar por número de expediente</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Ej. 000123"
            value={expediente}
            onChange={(e) => setExpediente(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary" disabled={buscando}>
            {buscando ? "Buscando…" : "Buscar"}
          </button>
        </div>
        {noEncontrado && (
          <div className="text-danger mt-2">No existe un paciente con ese expediente.</div>
        )}
      </form>

      {/* Info del paciente encontrada */}
      {paciente && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-2">Paciente</h5>
            <p className="mb-1"><strong>Expediente:</strong> {paciente.id}</p>
            <p className="mb-1"><strong>Nombre:</strong> {paciente.nombre || "—"}</p>
            <p className="mb-0">
              <strong>Edad:</strong> {paciente.edad ?? "—"} {paciente.genero ? `| ${paciente.genero}` : ""}
            </p>
          </div>
        </div>
      )}

      {/* Formulario de cita */}
      <form onSubmit={agendarCita}>
        <fieldset disabled={!paciente}>
          {/* Fecha y hora */}
          <label className="form-label">Fecha y hora</label>
          <input
            type="datetime-local"
            name="fechaHora"
            className="form-control mb-3"
            value={form.fechaHora}
            onChange={handleChange}
            required
          />

          {/* Área / Servicio */}
          <label className="form-label">Área / Servicio</label>
          <select
            name="area"
            className="form-control mb-3"
            value={form.area}
            onChange={handleChange}
            required
            disabled={cargandoDoctores}
          >
            <option value="">{cargandoDoctores ? "Cargando áreas…" : "Selecciona un área"}</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          {/* Doctor (filtrado por área) */}
          <label className="form-label">Doctor</label>
          <select
            name="doctorId"
            className="form-control mb-3"
            value={form.doctorId}
            onChange={handleChange}
            required
            disabled={!form.area || cargandoDoctores}
          >
            <option value="">
              {!form.area ? "Selecciona primero un área" : (cargandoDoctores ? "Cargando doctores…" : "Selecciona un doctor")}
            </option>
            {doctoresFiltrados.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre || d.id}{d.especialidad ? ` — ${d.especialidad}` : ""}
              </option>
            ))}
          </select>

          {/* Síntomas */}
          <label className="form-label">Síntomas</label>
          <textarea
            name="sintomas"
            placeholder="Describe los síntomas del paciente"
            className="form-control mb-3"
            rows={2}
            value={form.sintomas}
            onChange={handleChange}
          />

          {/* Prioridad */}
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

          {/* Motivo (opcional) */}
          <label className="form-label">Motivo (opcional)</label>
          <textarea
            name="motivo"
            placeholder="Motivo de la cita"
            className="form-control mb-4"
            rows={2}
            value={form.motivo}
            onChange={handleChange}
          />

          <button className="btn btn-primary w-100" disabled={agendando || !paciente} type="submit">
            {agendando ? "Agendando…" : "Agendar Cita"}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export default AgendarCitaForm;