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
        qPacientes = query(
          collection(db, "pacientes"),
          where("expediente", "==", busqueda.trim())
        );
      } else {
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
      setError("Error buscando paciente.");
    } finally {
      setLoading(false);
    }
  };

  const guardarCambiosCita = async (citaId, cambios) => {
    const citaOriginal = citas.find(c => c.id === citaId);
    const prioridadAnterior = citaOriginal.prioridad;
    const prioridadNueva = cambios.prioridad;

    // Confirmar cambio de prioridad
    if (prioridadNueva && prioridadAnterior !== prioridadNueva) {
      const confirmacion = window.confirm(
        `¿Está a punto de cambiar prioridad de ${prioridadAnterior.toUpperCase()} a ${prioridadNueva.toUpperCase()}?\n\n` 
      + '¿Desea continuar?');
      if (!confirmacion) {
        return;
      }
    }

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

      setCitas((prev) =>
        prev.map((c) => (c.id === citaId ? { ...c, ...updates } : c))
      );

      if (prioridadNueva && prioridadAnterior !== prioridadNueva) {
        alert(
          `Prioridad actualizada correctamente!\n\n` +
          `Cambio de prioridad: ${prioridadAnterior.toUpperCase()} →${prioridadNueva.toUpperCase()}\n\n` +
          `El sistema ha reordenado al paciente en la cola.`
        );
      } else {
        alert("Cita actualizada correctamente");
      }
      
    } catch (err) {
      console.error(err);
      alert("Error al actualizar cita. Revisa la consola");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 className="text-center mb-3">Modificar Citas / Cambiar Prioridades</h2>

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
          {loading ? "Buscando..." : "Buscar"}
        </button>
        <button className="btn btn-outline-secondary" onClick={limpiarBusqueda}>
          Limpiar
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {paciente && (
        <div className="card mb-3">
          <div className="card-body">
            <p><strong>Expediente:</strong> {paciente.expediente}</p>
            <p><strong>Nombre:</strong> {paciente.nombre}</p>
            {paciente.fechaNacimiento && (
              <p><strong>Fecha Nac.:</strong> {paciente.fechaNacimiento}</p>
            )}
          </div>
        </div>
      )}

      <div className="alert alert-info">
        <h6>Cambio de Prioridades:</h6>
        <small>
          <strong>ALTA:</strong> Se atiende primero (en casos urgentes)<br/>
          <strong>MEDIA:</strong> Se atiende después de prioridad alta<br/>
          <strong>BAJA:</strong> Se atiende al final (no tan urgentes)
        </small>
      </div>

      {citas.length > 0 ? (
        citas.map((cita) => (
          <CitaForm 
            key={cita.id} 
            cita={cita} 
            onGuardar={guardarCambiosCita} 
          />
        ))
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

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case "alta": return "danger";
      case "media": return "warning";
      case "baja": return "primary";
      default: return "secondary";
    }
  };

  const prioridadCambio = prioridad !== cita.prioridad;
  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onGuardar(cita.id, { sintomas, motivo, prioridad, atendido });
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleGuardar}
      className={`border rounded p-3 mb-3 bg-dark bg-opacity-50 ${prioridadCambio ? 'border-warning border-3' : ''}`}
    >
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Cita en Espera</h5>
        <span className={`badge bg-${getPrioridadColor(cita.prioridad)} px-3 py-2`}>
          PRIORIDAD ACTUAL: {cita.prioridad.toUpperCase()}
        </span>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <strong>Doctor:</strong> {cita.doctorNombre}
        </div>
        <div className="col-md-6">
          <strong>Área:</strong> {cita.area}
        </div>
        <div className="col-md-6">
          <strong>Fecha:</strong> {cita.fecha}
        </div>
        <div className="col-md-6">
          <strong>Horario:</strong> {cita.horario}
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Síntomas</label>
          <input
            className="form-control"
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            disabled={saving}
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Motivo</label>
          <input
            className="form-control"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-8">
          <label className="form-label">
            Prioridad 
            {prioridadCambio && (
              <span className="text-warning ms-2">
                (Cambio: {cita.prioridad.toUpperCase()} → {prioridad.toUpperCase()})
              </span>
            )}
          </label>
          <select
            className={`form-select ${prioridadCambio ? 'border-warning border-2' : ''}`}
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value)}
            disabled={saving}
          >
            <option value="alta">ALTA - Urgente</option>
            <option value="media">MEDIA - Normal</option>
            <option value="baja">BAJA - No urgente</option>
          </select>
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <div className="form-check">
          </div>
        </div>
      </div>

      <button 
        className={`btn w-100 ${prioridadCambio ? 'btn-warning' : 'btn-success'}`}
        type="submit" 
        disabled={saving}
      >
        {saving ? "Guardando informacion..." : prioridadCambio ? "GUARDAR Y CAMBIAR PRIORIDAD" : "Guardar Cambios"}
      </button>
    </form>
  );
}
export default ModificarExpediente;