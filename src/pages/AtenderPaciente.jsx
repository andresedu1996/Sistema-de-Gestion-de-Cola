
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";

function AtenderPaciente() {
  const [citas, setCitas] = useState([]);
  const [atendiendo, setAtendiendo] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "citas"), where("estado", "==", "en_espera"));
    
    //cambios en tiempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const citasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Ordenar por prioridad y luego por fecha
      citasData.sort((a, b) => {
        const prioridadOrden = { alta: 0, media: 1, baja: 2 };
        const prioA = prioridadOrden[a.prioridad] || 1;
        const prioB = prioridadOrden[b.prioridad] || 1;
        
        if (prioA !== prioB) {
          return prioA - prioB;
        }
        if (a.createdAt && b.createdAt) {
          return a.createdAt.toMillis() - b.createdAt.toMillis();
        }
        return 0;
      });

      setCitas(citasData);
    });

    return () => unsubscribe();
  }, []);

  const getPrioridadColor = (prioridad) => {
    switch(prioridad) {
      case "alta": return { bg: "danger", text: "white" };
      case "media": return { bg: "warning", text: "black" };
      case "baja": return { bg: "primary", text: "white" };
      default: return { bg: "secondary", text: "white" };
    }
  };

  const getPrioridadBorder = (prioridad) => {
    switch(prioridad) {
      case "alta": return "border-danger";
      case "media": return "border-warning";
      case "baja": return "border-info";
      default: return "border-secondary";
    }
  };

  const atenderSiguiente = async () => {
    if (citas.length === 0) return;
    //Mensaje de confirmacion
    const siguientePaciente = citas[0];
    const confirmacion = window.confirm(
      `¿Estas seguro de atender a ${siguientePaciente.pacienteNombre}?\n\n` +
      `Expediente: ${siguientePaciente.pacienteExpediente || siguientePaciente.pacienteId}\n` +
      `Prioridad: ${(siguientePaciente.prioridad || 'media').toUpperCase()}\n\n` +
      "Esta accion marcara al paciente como atendido y lo removera de la lista de espera."
    );
    
    if (!confirmacion) return;
    setAtendiendo(true);
    
    try {
      const citaRef = doc(db, "citas", siguientePaciente.id);
      await updateDoc(citaRef, {
        estado: "atendido",
        fechaAtencion: serverTimestamp()
      });

      alert("Paciente atendido correctamente");
      
    } catch (error) {
      console.error("Error:", error);
      alert("Error al atender paciente: " + error.message);
    } finally {
      setAtendiendo(false);
    }
  };
  const siguientePaciente = citas[0];

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h2 className="text-center mb-4">Atender Siguiente Paciente</h2>

      {siguientePaciente ? (
        <div className={`card mb-4 ${getPrioridadBorder(siguientePaciente.prioridad)} border-3`}>
          <div className={`card-header bg-${getPrioridadColor(siguientePaciente.prioridad).bg} text-${getPrioridadColor(siguientePaciente.prioridad).text}`}>
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Siguientes en la Cola</h4>
              <span className="fs-5">
                PRIORIDAD {(siguientePaciente.prioridad || 'media').toUpperCase()}
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <h5 className="text-primary">{siguientePaciente.pacienteNombre}</h5>
                <p><strong>Expediente:</strong> {siguientePaciente.pacienteExpediente || siguientePaciente.pacienteId}</p>
                <p><strong>Doctor:</strong> {siguientePaciente.doctorNombre}</p>
                <p><strong>Area:</strong> {citas[0].area || "No disponible"}</p>
                <p>
                <strong>Fecha:</strong> {citas[0].fecha?.toDate ? citas[0].fecha.toDate().toLocaleDateString() : citas[0].fecha || "No disponible"}
                </p>
                <p>
                <strong>Horario:</strong> {citas[0].fecha?.toDate ? citas[0].fecha.toDate().toLocaleTimeString() : citas[0].horario || "No disponible"}
                </p>
              </div>
            </div>
            
            {siguientePaciente.sintomas && (
              <div className="mt-3 p-3 bg-light rounded">
                <strong>Sintomas:</strong>
                <p className="mb-0 mt-1">{siguientePaciente.sintomas}</p>
              </div>
            )}
            
            {siguientePaciente.motivo && (
              <div className="mt-2 p-3 bg-light rounded">
                <strong>Motivo:</strong>
                <p className="mb-0 mt-1">{siguientePaciente.motivo}</p>
              </div>
            )}

            <button
              className="btn btn-success btn-lg w-100 mt-4 fw-bold"
              onClick={atenderSiguiente}
              disabled={atendiendo}
            >
              {atendiendo ? "Atendiendo..." : "ATENDER PACIENTE"}
            </button>
          </div>
        </div>
      ) : (
        <div className="alert alert-info text-center">
          <h4>No hay pacientes en espera</h4>
          <p>Todos los pacientes han sido atendidos</p>
        </div>
      )}

      {citas.length > 1 && (
        <div className="card">
          <div className="card-header bg-secondary text-white">
            <h5 className="mb-0">Siguientes en la cola ({citas.length - 1})</h5>
          </div>
          <div className="card-body">
            {citas.slice(1, 6).map((cita, index) => {
              const colorInfo = getPrioridadColor(cita.prioridad);
              return (
                <div 
                  key={cita.id} 
                  className={`d-flex justify-content-between align-items-center mb-3 p-3 rounded border-3 ${getPrioridadBorder(cita.prioridad)}`}
                  style={{ backgroundColor: 'white' }}
                >
                  <div>
                    <strong>#{index + 2}: {cita.pacienteNombre}</strong>
                    <div className="text-muted small">
                      {cita.area} - Dr. {cita.doctorNombre}
                    </div>
                  </div>
                  <span className={`badge bg-${colorInfo.bg} text-${colorInfo.text} fs-6 px-3 py-2`}>
                    {(cita.prioridad || 'media').toUpperCase()}
                  </span>
                </div>
              );
            })}
            {citas.length > 6 && (
              <div className="text-center text-muted">
                <small>... y {citas.length - 6} pacientes mas en espera</small>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <div className="card border-0 bg-light">
          <div className="card-body">
            <h6 className="card-title">Codigo de colores:</h6>
            <div className="d-flex gap-3 flex-wrap">
              <span className="badge bg-danger text-white px-3 py-2">ALTA - Urgente</span>
              <span className="badge bg-warning text-black px-3 py-2">MEDIA - Normal</span>
              <span className="badge bg-primary text-white px-3 py-2">BAJA - No urgente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AtenderPaciente;