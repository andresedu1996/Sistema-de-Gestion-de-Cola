import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [sortUrgencia, setSortUrgencia] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "pacientes"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPacientes(data);
    };
    fetchData();
  }, []);

  const pacientesOrdenados = sortUrgencia
    ? [...pacientes].sort((a, b) => a.urgencia - b.urgencia)
    : pacientes;

  return (
    <div>
      <h2 className="text-center mb-3">Lista de Espera</h2>
      <button 
        className="btn btn-primary mb-3"
        onClick={() => setSortUrgencia(!sortUrgencia)}
      >
        {sortUrgencia ? "Quitar orden por urgencia" : "Ordenar por urgencia"}
      </button>

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
          {pacientesOrdenados.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.nombre}</td>
              <td>{p.edad}</td>
              <td>{p.sintomas}</td>
              <td>
                {p.urgencia === "1" ? "Alta" : p.urgencia === "2" ? "Media" : "Baja"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListaPacientes;
