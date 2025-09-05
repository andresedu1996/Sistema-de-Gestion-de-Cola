import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function ListaDoctores() {
  const [doctores, setDoctores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "doctores"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDoctores(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2 className="text-center mb-3">Listado de Doctores</h2>
      <div className="row">
        {doctores.map(d => (
          <div key={d.id} className="col-md-4">
            <div className="card bg-dark text-light mb-4">
              <div className="card-body">
                <h5 className="card-title">{d.nombre}</h5>
                <p className="card-text">
                  <strong>Área:</strong> {d.area} <br />
                  <strong>Teléfono:</strong> {d.telefono} <br />
                  <strong>Edificio:</strong> {d.edificio} <br />
                  <strong>Consultorio:</strong> {d.consultorio}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListaDoctores;
