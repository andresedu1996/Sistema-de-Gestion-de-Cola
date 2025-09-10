import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, getDoc, doc } from "firebase/firestore";

function ListaPacientes() {
  const [citas, setCitas] = useState([]); // todas las citas en_espera
  const [pacientesMap, setPacientesMap] = useState(new Map()); // para almacenar datos de los pacientes

  useEffect(() => {
    // Escucha de citas
    const qCitas = query(collection(db, "citas"), where("estado", "==", "en_espera"));
    const unsubCitas = onSnapshot(qCitas, async (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCitas(rows);

      // Cargar datos de pacientes asociados
      const pacientesSet = new Set(rows.map(c => c.pacienteId || c.pacienteExpediente));
      const map = new Map(pacientesMap); // copiar estado actual
      for (const id of pacientesSet) {
        if (!map.has(id)) {
          try {
            const ref = doc(db, "pacientes", id);
            const snapPac = await getDoc(ref);
            if (snapPac.exists()) {
              map.set(id, snapPac.data());
            }
          } catch (err) {
            console.error("Error cargando paciente", id, err);
          }
        }
      }
      setPacientesMap(map);
    });

    return () => unsubCitas();
  }, []);

  const prioridadPeso = { alta: 0, media: 1, baja: 2 };

  const listaOrdenada = useMemo(() => {
    const fusion = citas.map((cita) => {
      let fecha = "—";
      let hora = "";

      if (cita.fecha && cita.horario) {
        const fechaObj = new Date(cita.fecha);
        fecha = fechaObj.toLocaleDateString();
        hora = cita.horario;
      } else if (cita.fechaHora) {
        const fechaObj = new Date(cita.fechaHora);
        fecha = fechaObj.toLocaleDateString();
        hora = fechaObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }

      const pacienteData = pacientesMap.get(cita.pacienteId || cita.pacienteExpediente) || {};

      return {
        id: cita.id,
        expediente: cita.pacienteExpediente || cita.pacienteId,
        nombre: cita.pacienteNombre || pacienteData.nombre || "—",
        edad: pacienteData.edad ?? "—",
        prioridad: (cita.prioridad || "media").toLowerCase(),
        fecha,
        hora,
        doctor: cita.doctorNombre || "—",
      };
    });

    fusion.sort((a, b) => {
      const pa = prioridadPeso[a.prioridad] ?? 1;
      const pb = prioridadPeso[b.prioridad] ?? 1;
      if (pa !== pb) return pa - pb;

      const ta = a.fecha ? Date.parse(a.fecha) : Infinity;
      const tb = b.fecha ? Date.parse(b.fecha) : Infinity;
      if (ta !== tb) return ta - tb;

      return String(a.expediente).localeCompare(String(b.expediente));
    });

    return fusion;
  }, [citas, pacientesMap]);

  return (
    <div>
      <h2 className="text-center mb-3">Lista de Espera</h2>

      <table className="table table-striped table-dark">
        <thead>
          <tr>
            <th>Expediente</th>
            <th>Nombre</th>
            <th>Edad</th>
            <th>Prioridad</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Doctor</th>
          </tr>
        </thead>
        <tbody>
          {listaOrdenada.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                Sin citas en espera 🙌
              </td>
            </tr>
          ) : (
            listaOrdenada.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.expediente}</td>
                <td>{cita.nombre}</td>
                <td>{cita.edad}</td>
                <td style={{ textTransform: "capitalize" }}>{cita.prioridad}</td>
                <td>{cita.fecha}</td>
                <td>{cita.hora}</td>
                <td>{cita.doctor}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ListaPacientes;
