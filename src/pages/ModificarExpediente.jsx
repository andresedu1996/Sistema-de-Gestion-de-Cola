// src/pages/ModificarExpediente.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

function ModificarExpediente() {
  const [busqueda, setBusqueda] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const limpiarBusqueda = () => {
    setBusqueda("");
    setPaciente(null);
    setCitas([]);
    setError("");
  };

  const buscarPaciente = async () => {
    setLoading(true);
    setPaciente(null);
    setCitas([]);
    setError("");

    if (!busqueda.trim()) {
      setError("Ingresa un expediente o nombre");
      setLoading(false);
      return;
    }

    try {
      let qPacientes;
      if (/^\d+$/.test(busqueda.trim())) {
        // buscar por expediente
        qPacientes = query(
          collection(db, "pacientes"),
          where("expediente", "==", busqueda.trim())
        );
      } else {
        // buscar por nombre exacto
        qPacientes = query(
          collection(db, "pacientes"),
          where("nombre", "==", busqueda.trim())
        );
      }

      const snap = await getDocs(qPacientes);
      if (snap.empty) {
        setError("Paciente no encontrado");
        setLoading(false);
        return;
      }

      const pacData = snap.docs[0];
      setPaciente({ id: pacData.id, ...pacData.data() });

      // Cargar citas en_espera de este paciente
      const qCitas = query(
        collection(db, "citas"),
        where("estado", "==", "en_espera"),
        where("pacienteId", "==", pacData.id)
      );
      const snapCitas = await getDocs(qCitas);
      const citasData = snapCitas.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCitas(citasData);
    } catch (err) {
      console.error(err);
      setError("Error buscando paciente. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const guardarCambiosCita = async (citaId, cambios) => {
    try {
      const citaRef = doc(db, "citas", citaId);
      const updates = {
        ...cambios,
        updatedAt: serverTimestamp(),
      };
      if (cambios.atendido) {
        updates.estado = "atendida";
        updates.atendidoAt = serverTimestamp();
      }
      await updateDoc(citaRef, updates);

      // Actualizar estado en el frontend
      setCitas((prev) =>
        prev.map((c) => (c.id === citaId ? { ...c, ...updates } : c))
      );

      alert("✅ Cita actualizada correctamente");
    } catch (err) {
      console.error(err);
      alert("❌ Error al actualizar cita. Revisa la consola");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 className="text-center mb-3">Modificar Expediente / Citas</h2>

      {/* Búsqueda */}
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Expediente o nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button
          className="btn btn-secondary"
          onClick={buscarPaciente}
          disabled={loading}
        >
          {loading ? "Buscando…" : "Buscar"}
        </button>
        <button className="btn btn-outline-secondary" onClick={limpiarBusqueda}>
          Limpiar
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Info paciente */}
      {paciente && (
        <div className="card mb-3">
          <div className="card-body">
            <p>
              <strong>Expediente:</strong> {paciente.expediente}
            </p>
            <p>
              <strong>Nombre:</strong> {paciente.nombre}
            </p>
            {paciente.fechaNacimiento && (
              <p>
                <strong>Fecha Nac.:</strong> {paciente.fechaNacimiento}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Lista de citas */}
      {citas.length > 0 ? (
        citas.map((cita) => <CitaForm key={cita.id} cita={cita} onGuardar={guardarCambiosCita} />)
      ) : paciente ? (
        <div className="alert alert-info">No hay citas en espera para este paciente</div>
      ) : null}
    </div>
  );
}

function CitaForm({ cita, onGuardar }) {
  const [sintomas, setSintomas] = useState(cita.sintomas || "");
  const [motivo, setMotivo] = useState(cita.motivo || "");
  const [prioridad, setPrioridad] = useState(cita.prioridad || "media");
  const [atendido, setAtendido] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onGuardar(cita.id, { sintomas, motivo, prioridad, atendido });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleGuardar}
      className="border rounded p-3 mb-3 bg-dark bg-opacity-50"
    >
      <div className="mb-2">
        <strong>Doctor:</strong> {cita.doctorNombre}
      </div>
      <div className="mb-2">
        <strong>Área:</strong> {cita.area}
      </div>
      <div className="mb-2">
        <strong>Fecha:</strong> {cita.fecha}
      </div>
      <div className="mb-2">
        <strong>Horario:</strong> {cita.horario}
      </div>

      <div className="mb-2">
        <label className="form-label">Síntomas</label>
        <input
          className="form-control"
          value={sintomas}
          onChange={(e) => setSintomas(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Motivo</label>
        <input
          className="form-control"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          disabled={saving}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Prioridad</label>
        <select
          className="form-select"
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          disabled={saving}
        >
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      <div className="form-check mb-2">
        <input
          type="checkbox"
          className="form-check-input"
          id={`atendido-${cita.id}`}
          checked={atendido}
          onChange={(e) => setAtendido(e.target.checked)}
          disabled={saving}
        />
        <label className="form-check-label" htmlFor={`atendido-${cita.id}`}>
          Marcar como atendido
        </label>
      </div>

      <button className="btn btn-success w-100" type="submit" disabled={saving}>
        {saving ? "Guardando…" : "Guardar Cambios"}
      </button>
    </form>
  );
}

export default ModificarExpediente;
