import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

class Nodo {
  constructor(valor) {
    this.valor = valor;
    this.prev = null;
    this.next = null;
  }
}

class ListaDoblementeEnlazada {
  constructor() {
    this.head = null; 
    this.tail = null; 
    this.length = 0;
  }
  push(valor) {
    const nodo = new Nodo(valor);
    if (!this.head) {
      this.head = this.tail = nodo;
    } else {
      this.tail.next = nodo;
      nodo.prev = this.tail;
      this.tail = nodo;
    }
    this.length++;
    return nodo;
  }
  toArray() {
    const arr = [];
    let actual = this.head;
    while (actual) {
      arr.push(actual.valor);
      actual = actual.next;
    }
    return arr;
  }
}

function HistorialAtendidos() {
  const [cargando, setCargando] = useState(true);
  const [actual, setActual] = useState(null); 
  const listaRef = useRef(new ListaDoblementeEnlazada());
  const nodosMapRef = useRef(new Map());
  const [longitud, setLongitud] = useState(0);
  const [historial, setHistorial] = useState([]); 
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return { bg: "danger", text: "white" };
      case "media":
        return { bg: "warning", text: "black" };
      case "baja":
        return { bg: "primary", text: "white" };
      default:
        return { bg: "secondary", text: "white" };
    }
  };

  const getPrioridadBorder = (prioridad) => {
    switch (prioridad) {
      case "alta":
        return "border-danger";
      case "media":
        return "border-warning";
      case "baja":
        return "border-info";
      default:
        return "border-secondary";
    }
  };

  useEffect(() => {
    const q = query(collection(db, "citas"), where("estado", "==", "atendido"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const datos = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const fa = (a.fechaAtencion?.toMillis?.() || a.createdAt?.toMillis?.() || 0);
          const fb = (b.fechaAtencion?.toMillis?.() || b.createdAt?.toMillis?.() || 0);
          return fb - fa; 
        });

      const lista = new ListaDoblementeEnlazada();
      const nodosMap = new Map();
      let primerNodo = null;
      datos.forEach((item, idx) => {
        const nodo = lista.push(item);
        nodosMap.set(item.id, nodo);
        if (idx === 0) primerNodo = nodo;
      });

      listaRef.current = lista;
      nodosMapRef.current = nodosMap;
      setLongitud(lista.length);
      setActual(primerNodo);
      setHistorial(lista.toArray());
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  const listaFiltrada = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return historial.filter((item) => {
      const pasaPrioridad = filtro === "todas" || (item.prioridad || "media") === filtro;
      if (!pasaPrioridad) return false;
      if (!q) return true;
      const texto = `${item.pacienteNombre || ""} ${item.pacienteExpediente || item.pacienteId || ""} ${item.doctorNombre || ""} ${item.area || ""}`.toLowerCase();
      return texto.includes(q);
    });
  }, [historial, busqueda, filtro]);

  useEffect(() => {
    if (!actual) return;
    const actualId = actual?.valor?.id;
    const sigueVisible = listaFiltrada.some((it) => it.id === actualId);
    if (!sigueVisible) {
      if (listaFiltrada.length > 0) {
        const nodo = nodosMapRef.current.get(listaFiltrada[0].id);
        setActual(nodo || null);
      } else {
        setActual(null);
      }
    }
  }, [listaFiltrada, actual]);

  const moverAnterior = () => {
    if (actual?.prev) setActual(actual.prev);
  };
  const moverSiguiente = () => {
    if (actual?.next) setActual(actual.next);
  };

  const formatoFecha = (ts) => {
    try {
      const d = ts?.toDate ? ts.toDate() : ts instanceof Date ? ts : null;
      if (!d) return "No disponible";
      return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
    } catch {
      return "No disponible";
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <h2 className="text-center mb-4">Historial de Pacientes Atendidos</h2>

      {/* Barra de búsqueda y filtros */}
      <div className="card mb-3">
        <div className="card-body d-flex gap-2 flex-wrap align-items-center">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre, expediente, doctor o área"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ minWidth: 240 }}
          />
          <select className="form-select" style={{ width: 180 }} value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todas">Todas las prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
          <span className="ms-auto text-muted small">Mostrando {listaFiltrada.length} de {longitud}</span>
        </div>
      </div>

      {cargando ? (
        <div className="alert alert-secondary text-center">Cargando historial...</div>
      ) : listaFiltrada.length === 0 ? (
        <div className="alert alert-info text-center">
          <h5>No hay resultados</h5>
          <p>Ajusta la búsqueda o filtros.</p>
        </div>
      ) : (
        <div className="row g-3">
          {/* Card izquierdo para la lista de tiempo */}
          <div className="col-md-5">
            <div className="card h-100">
              <div className="card-header bg-secondary text-white">
                <strong>Historial</strong>
              </div>
              <div className="card-body" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                {listaFiltrada.map((item) => {
                  const active = actual?.valor?.id === item.id;
                  const colorInfo = getPrioridadColor(item.prioridad);
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActual(nodosMapRef.current.get(item.id) || actual)}
                      className={`d-flex justify-content-between align-items-center p-3 rounded mb-2 border ${active ? "border-primary bg-light" : "border-light"}`}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="fw-semibold">
                          {item.pacienteNombre}
                          {active && <span className="badge bg-primary ms-2">Seleccionado</span>}
                        </div>
                        <div className="text-muted small">
                          {item.area || ""} · Dr. {item.doctorNombre || ""}
                        </div>
                        <div className="text-muted small">{formatoFecha(item.fechaAtencion)}</div>
                      </div>
                      <span className={`badge bg-${colorInfo.bg} text-${colorInfo.text}`}>{(item.prioridad || "media").toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card derecho para el detalle del seleccionado */}
          <div className="col-md-7">
            {actual && (
              <div className={`card ${getPrioridadBorder(actual.valor.prioridad)} border-3`}>
                <div className={`card-header bg-${getPrioridadColor(actual.valor.prioridad).bg} text-${getPrioridadColor(actual.valor.prioridad).text}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Detalle del paciente</h4>
                    <span className="fs-6">PRIORIDAD {(actual.valor.prioridad || "media").toUpperCase()}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <h5 className="text-primary mb-2">{actual.valor.pacienteNombre}</h5>
                      <div className="row g-2">
                        <div className="col-sm-6"><strong>Expediente:</strong> {actual.valor.pacienteExpediente || actual.valor.pacienteId}</div>
                        <div className="col-sm-6"><strong>Doctor:</strong> {actual.valor.doctorNombre}</div>
                        <div className="col-sm-6"><strong>Área:</strong> {actual.valor.area || "No disponible"}</div>
                        <div className="col-sm-6"><strong>Atendido:</strong> {formatoFecha(actual.valor.fechaAtencion)}</div>
                      </div>

                      {actual.valor.sintomas && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <strong>Síntomas:</strong>
                          <p className="mb-0 mt-1">{actual.valor.sintomas}</p>
                        </div>
                      )}
                      {actual.valor.motivo && (
                        <div className="mt-2 p-3 bg-light rounded">
                          <strong>Motivo:</strong>
                          <p className="mb-0 mt-1">{actual.valor.motivo}</p>
                        </div>
                      )}

                      <div className="d-flex gap-2 mt-4">
                        <button className="btn btn-outline-secondary w-50" onClick={moverAnterior} disabled={!actual.prev}>← Anterior</button>
                        <button className="btn btn-success w-50" onClick={moverSiguiente} disabled={!actual.next}>Siguiente →</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HistorialAtendidos;