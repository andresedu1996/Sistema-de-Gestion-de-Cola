import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";

function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [sortUrgencia, setSortUrgencia] = useState(false);

  useEffect(() => {
    // Suscripción en tiempo real a todos los pacientes
    const colRef = collection(db, "pacientes");
    const unsub = onSnapshot(colRef, (snap) => {
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPacientes(data);
    });
    return () => unsub();
  }, []);

  // Oculta los atendidos (atendido === true)
  const visibles = useMemo(
    () => pacientes.filter((p) => !p.atendido),
    [pacientes]
  );

  // Orden por urgencia (convierte a número por si viene como string)
  const pacientesOrdenados = useMemo(() => {
    if (!sortUrgencia) return visibles;
    return [...visibles].sort(
      (a, b) => Number(a.urgencia ?? 99) - Number(b.urgencia ?? 99)
    );
  }, [visibles, sortUrgencia]);

  // Helper para mostrar texto de urgencia
  const urgenciaTexto = (u) => {
    const val = String(u ?? "");
    return val === "1" ? "Alta" : val === "2" ? "Media" : val === "3" ? "Baja" : "—";
  };

  return (
    <div>
      <h2 className="text-center mb-3">Lista de Espera</h2>

      <div className="text-center mb-3">
        <button
          className="btn btn-primary"
          onClick={() => setSortUrgencia(!sortUrgencia)}
        >
          {sortUrgencia ? "Quitar orden por urgencia" : "Ordenar por urgencia"}
        </button>
      </div>

      <table className="table table-striped table-dark">
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Síntomas</th>
            <th>Urgencia</th>
          </tr>
        </thead>
        <tbody>
          {pacientesOrdenados.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">
                Sin pacientes en espera 🙌
              </td>
            </tr>
          ) : (
            pacientesOrdenados.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nombre}</td>
                <td>{p.edad}</td>
                <td>{p.sintomas}</td>
                <td>{urgenciaTexto(p.urgencia)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ListaPacientes;