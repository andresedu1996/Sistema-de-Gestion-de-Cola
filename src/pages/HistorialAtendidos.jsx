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
  const [nodoActual, setNodoActual] = useState(null); 
  const listaHistorialRef = useRef(new ListaDoblementeEnlazada());
  const mapaNodosRef = useRef(new Map());
  const [longitud, setLongitud] = useState(0);
  const [historial, setHistorial] = useState([]); 
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todas");

  const obtenerColorPrioridad = (prioridad) => {
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

  const obtenerBordePrioridad = (prioridad) => {
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
    const consulta = query(collection(db, "citas"), where("estado", "==", "atendido"));

    const desuscribirse = onSnapshot(consulta, (instantanea) => {
      const registros = instantanea.docs
        .map((docu) => ({ id: docu.id, ...docu.data() }))
        .sort((a, b) => {
          const fechaA = (a.fechaAtencion?.toMillis?.() || a.createdAt?.toMillis?.() || 0);
          const fechaB = (b.fechaAtencion?.toMillis?.() || b.createdAt?.toMillis?.() || 0);
          return fechaB - fechaA; 
        });

      const lista = new ListaDoblementeEnlazada();
      const mapaNodos = new Map();
      let primerNodo = null;
      registros.forEach((registro, indice) => {
        const nodo = lista.push(registro);
        mapaNodos.set(registro.id, nodo);
        if (indice === 0) primerNodo = nodo;
      });

      listaHistorialRef.current = lista;
      mapaNodosRef.current = mapaNodos;
      setLongitud(lista.length);
      setNodoActual(primerNodo);
      setHistorial(lista.toArray());
      setCargando(false);
    });

    return () => desuscribirse();
  }, []);

  const historialFiltrado = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();
    return historial.filter((registro) => {
      const coincidePrioridad = filtro === "todas" || (registro.prioridad || "media") === filtro;
      if (!coincidePrioridad) return false;
      if (!textoBusqueda) return true;
      const cadena = `${registro.pacienteNombre || ""} ${registro.pacienteExpediente || registro.pacienteId || ""} ${registro.doctorNombre || ""} ${registro.area || ""}`.toLowerCase();
      return cadena.includes(textoBusqueda);
    });
  }, [historial, busqueda, filtro]);

  useEffect(() => {
    if (!nodoActual) return;
    const idActual = nodoActual?.valor?.id;
    const sigueVisible = historialFiltrado.some((reg) => reg.id === idActual);
    if (!sigueVisible) {
      if (historialFiltrado.length > 0) {
        const nodo = mapaNodosRef.current.get(historialFiltrado[0].id);
        setNodoActual(nodo || null);
      } else {
        setNodoActual(null);
      }
    }
  }, [historialFiltrado, nodoActual]);

  const moverAnterior = () => {
    if (nodoActual?.prev) setNodoActual(nodoActual.prev);
  };
  const moverSiguiente = () => {
    if (nodoActual?.next) setNodoActual(nodoActual.next);
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
          <span className="ms-auto text-muted small">Mostrando {historialFiltrado.length} de {longitud}</span>
        </div>
      </div>

      {cargando ? (
        <div className="alert alert-secondary text-center">Cargando historial...</div>
      ) : historialFiltrado.length === 0 ? (
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
                {historialFiltrado.map((registro) => {
                  const estaSeleccionado = nodoActual?.valor?.id === registro.id;
                  const infoColor = obtenerColorPrioridad(registro.prioridad);
                  return (
                    <div
                      key={registro.id}
                      onClick={() => setNodoActual(mapaNodosRef.current.get(registro.id) || nodoActual)}
                      className={`d-flex justify-content-between align-items-center p-3 rounded mb-2 border ${estaSeleccionado ? "border-primary bg-light" : "border-light"}`}
                      style={{ cursor: "pointer" }}
                    >
                      <div>
                        <div className="fw-semibold">
                          {registro.pacienteNombre}
                          {estaSeleccionado && <span className="badge bg-primary ms-2">Seleccionado</span>}
                        </div>
                        <div className="text-muted small">
                          {registro.area || ""} · Dr. {registro.doctorNombre || ""}
                        </div>
                        <div className="text-muted small">{formatoFecha(registro.fechaAtencion)}</div>
                      </div>
                      <span className={`badge bg-${infoColor.bg} text-${infoColor.text}`}>{(registro.prioridad || "media").toUpperCase()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card derecho para el detalle del seleccionado */}
          <div className="col-md-7">
            {nodoActual && (
              <div className={`card ${obtenerBordePrioridad(nodoActual.valor.prioridad)} border-3`}>
                <div className={`card-header bg-${obtenerColorPrioridad(nodoActual.valor.prioridad).bg} text-${obtenerColorPrioridad(nodoActual.valor.prioridad).text}`}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">Detalle del paciente</h4>
                    <span className="fs-6">PRIORIDAD {(nodoActual.valor.prioridad || "media").toUpperCase()}</span>
                  </div>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <h5 className="text-primary mb-2">{nodoActual.valor.pacienteNombre}</h5>
                      <div className="row g-2">
                        <div className="col-sm-6"><strong>Expediente:</strong> {nodoActual.valor.pacienteExpediente || nodoActual.valor.pacienteId}</div>
                        <div className="col-sm-6"><strong>Doctor:</strong> {nodoActual.valor.doctorNombre}</div>
                        <div className="col-sm-6"><strong>Área:</strong> {nodoActual.valor.area || "No disponible"}</div>
                        <div className="col-sm-6"><strong>Atendido:</strong> {formatoFecha(nodoActual.valor.fechaAtencion)}</div>
                      </div>

                      {nodoActual.valor.sintomas && (
                        <div className="mt-3 p-3 bg-light rounded">
                          <strong>Síntomas:</strong>
                          <p className="mb-0 mt-1">{nodoActual.valor.sintomas}</p>
                        </div>
                      )}
                      {nodoActual.valor.motivo && (
                        <div className="mt-2 p-3 bg-light rounded">
                          <strong>Motivo:</strong>
                          <p className="mb-0 mt-1">{nodoActual.valor.motivo}</p>
                        </div>
                      )}

                      <div className="d-flex gap-2 mt-4">
                        <button className="btn btn-outline-secondary w-50" onClick={moverAnterior} disabled={!nodoActual.prev}>← Anterior</button>
                        <button className="btn btn-success w-50" onClick={moverSiguiente} disabled={!nodoActual.next}>Siguiente →</button>
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