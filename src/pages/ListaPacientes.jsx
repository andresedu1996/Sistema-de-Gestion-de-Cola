import React, { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

function ListaPacientes() {
  const [pacientes, setPacientes] = useState([]); // pacientes enEspera
  const [citas, setCitas] = useState([]);         // citas en_espera

  useEffect(() => {
    // 1) Escuchar pacientes en espera
    const qPac = query(collection(db, "pacientes"), where("enEspera", "==", true));
    const unsubPac = onSnapshot(qPac, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPacientes(rows);
    });

    // 2) Escuchar citas en_espera (de cualquier paciente)
    const qCitas = query(collection(db, "citas"), where("estado", "==", "en_espera"));
    const unsubCitas = onSnapshot(qCitas, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCitas(rows);
    });

    return () => {
      unsubPac();
      unsubCitas();
    };
  }, []);

  const prioridadPeso = { alta: 0, media: 1, baja: 2 };

  const lista = useMemo(() => {
    // indexar citas por expediente y/o ultimaCitaId
    const porExp = new Map();
    const porId = new Map();
    for (const c of citas) {
      if (c.pacienteExpediente) porExp.set(c.pacienteExpediente, c);
      porId.set(c.id, c);
    }

    // fusionar paciente + cita correspondiente
    const fusion = pacientes.map((p) => {
      const cita =
        (p.ultimaCitaId && porId.get(p.ultimaCitaId)) ||
        porExp.get(p.id) ||
        null;

      const prioridad = (cita?.prioridad || "media").toLowerCase();
      const fechaHora = cita?.fechaHora || p.ultimaCitaFecha || null;

      return {
        expediente: p.id,
        nombre: p.nombre || "—",
        edad: p.edad ?? "—",
        prioridad,
        fechaHora,     // útil para desempatar
      };
    });

    // ordenar por prioridad (alta -> media -> baja), luego por fecha (más próxima primero), luego por expediente
    fusion.sort((a, b) => {
      const pa = prioridadPeso[a.prioridad] ?? 1;
      const pb = prioridadPeso[b.prioridad] ?? 1;
      if (pa !== pb) return pa - pb;

      const ta = a.fechaHora ? Date.parse(a.fechaHora) : Infinity;
      const tb = b.fechaHora ? Date.parse(b.fechaHora) : Infinity;
      if (ta !== tb) return ta - tb;

      return String(a.expediente).localeCompare(String(b.expediente));
    });

    return fusion;
  }, [pacientes, citas]);

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
            <th>Fecha cita</th>
          </tr>
        </thead>
        <tbody>
          {lista.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">
                Sin pacientes en espera 🙌
              </td>
            </tr>
          ) : (
            lista.map((p) => (
              <tr key={p.expediente}>
                <td>{p.expediente}</td>
                <td>{p.nombre}</td>
                <td>{p.edad}</td>
                <td style={{ textTransform: "capitalize" }}>{p.prioridad}</td>
                <td>
                  {p.fechaHora
                    ? new Date(p.fechaHora).toLocaleString()
                    : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ListaPacientes;