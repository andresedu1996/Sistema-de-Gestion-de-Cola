import React, { useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

function ModificarExpediente() {
  const [expedienteInput, setExpedienteInput] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [urgencia, setUrgencia] = useState("");
  const [sintomas, setSintomas] = useState("");
  const [edad, setEdad] = useState("");
  const [atendido, setAtendido] = useState(false);

  const limpiarFormulario = () => {
    setExpedienteInput("");
    setPaciente(null);
    setUrgencia("");
    setSintomas("");
    setEdad("");
    setAtendido(false);
  };

  const buscarPaciente = async (e) => {
    e.preventDefault();
    setError("");
    setPaciente(null);

    const id = (expedienteInput || "").trim();
    if (!id) {
      setError("Ingresa un número de expediente.");
      return;
    }

    try {
      setLoading(true);
      const ref = doc(db, "pacientes", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setError(`No se encontró el expediente ${id}.`);
        return;
      }
      const data = snap.data();

      setPaciente({ id, ...data });
      setUrgencia(data.urgencia === 0 || data.urgencia ? String(data.urgencia) : "");
      setSintomas(String(data.sintomas ?? ""));
      setEdad(data.edad === 0 || data.edad ? String(data.edad) : "");
      setAtendido(Boolean(data.atendido ?? false));
    } catch (e) {
      console.error(e);
      setError("Error al buscar el expediente. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (!paciente) return;

    try {
      setSaving(true);
      const ref = doc(db, "pacientes", paciente.id);

      const urgenciaNumber = urgencia === "" ? null : Number(urgencia);
      const edadNumber = edad === "" ? null : Number(edad);

      const updates = {
        urgencia:
          urgenciaNumber !== null
            ? urgenciaNumber
            : (typeof paciente.urgencia === "number" ? paciente.urgencia : null),
        sintomas,
        edad: edadNumber,
        atendido,
        ...(atendido ? { enEspera: false, atendidoAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(ref, updates);

      alert("✅ Expediente actualizado correctamente.");
      setPaciente((prev) => (prev ? { ...prev, ...updates } : prev));

      if (atendido) {
        limpiarFormulario();
      }
    } catch (e) {
      console.error(e);
      alert("❌ No se pudieron guardar los cambios. Revisa la consola.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ textAlign: "left", maxWidth: 640, margin: "0 auto" }}>
      <h2 className="text-center mb-3">Modificar Expediente</h2>

      <form onSubmit={buscarPaciente} className="mb-3">
        <label className="form-label">Número de Expediente</label>
        <div className="input-group">
          <input
            className="form-control"
            placeholder="Ej: 000123"
            value={expedienteInput}
            onChange={(e) => setExpedienteInput(e.target.value)}
          />
          <button className="btn btn-info" type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </div>
      </form>

      {error && <div className="alert alert-danger">{error}</div>}

      {paciente && (
        <form onSubmit={guardarCambios} className="bg-dark bg-opacity-50 p-3 rounded">
          <div className="mb-2"><strong>Expediente:</strong> {paciente.id}</div>
          <div className="mb-2"><strong>Nombre:</strong> {paciente.nombre || "—"}</div>
          <div className="mb-2"><strong>Fecha Nac.:</strong> {paciente.fechaNacimiento || "—"}</div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Urgencia</label>
              <select
                className="form-select"
                value={urgencia}
                onChange={(e) => setUrgencia(e.target.value)}
                disabled={saving}
              >
                <option value="">—</option>
                <option value="1">Alta</option>
                <option value="2">Media</option>
                <option value="3">Baja</option>
              </select>
            </div>

            <div className="col-md-4 mb-3">
              <label className="form-label">Edad</label>
              <input
                type="number"
                className="form-control"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                min="0"
                disabled={saving}
              />
            </div>

            <div className="col-md-4 mb-3 d-flex align-items-end">
              <div className="form-check">
                <input
                  id="chkAtendido"
                  className="form-check-input"
                  type="checkbox"
                  checked={atendido}
                  onChange={(e) => setAtendido(e.target.checked)}
                  disabled={saving}
                />
                <label htmlFor="chkAtendido" className="form-check-label">
                  Marcar como atendido
                </label>
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Síntomas</label>
            <input
              className="form-control"
              value={sintomas}
              onChange={(e) => setSintomas(e.target.value)}
              disabled={saving}
            />
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={limpiarFormulario}
              disabled={saving}
            >
              Limpiar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default ModificarExpediente;