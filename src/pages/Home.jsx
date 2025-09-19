import React, { useState } from "react";
import {
  FaUserPlus,
  FaEdit,
  FaListUl,
  FaUserMd,
  FaArrowLeft,
  FaCalendarAlt,
  FaUserCheck,
  FaHistory,
} from "react-icons/fa";

import ListaPacientes from "./ListaPacientes.jsx";
import ListaDoctores from "./ListaDoctores.jsx";
import PacienteForm from "./PacienteForm.jsx";
import ModificarExpediente from "./ModificarExpediente.jsx";
import AgendarCitaForm from "./AgendarCitaForm.jsx";
import AtenderPaciente from "./AtenderPaciente.jsx";
import HistorialAtendidos from "./HistorialAtendidos.jsx";

function Home() {
  const [activeTab, setActiveTab] = useState("inicio");

  const BG_URL =
    "https://international.quironsalud.com/es/hospitales/hospitales-referencia.ficheros/3348740-Hospitals-in-Spain.jpg";

  //Estilos comunes de las cards
  const cardBaseStyle = {
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  };
  //funciones hover reutilizables
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-3px)";
    e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
  };
  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        position: "relative",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Fondo */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
          filter: "brightness(0.65)",
        }}
      />

      {/* Contenido */}
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
        }}
      >
        {/* Pantalla de Inicio */}
        {activeTab === "inicio" && (
          <div style={{ textAlign: "center", width: "100%" }}>
            <h1
              className="mb-4"
              style={{
                fontSize: "2.2rem",
                textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
              }}
            >
              Hospital Vida
            </h1>
            <div className="container">
              <div className="row justify-content-center g-4">
                {/* Card Crear Expediente */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow-lg"
                    style={cardBaseStyle}
                    onClick={() => setActiveTab("pacientes")}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-body">
                      <FaUserPlus size={40} className="mb-3 text-primary" />
                      <h5 className="card-title">Crear Expediente</h5>
                    </div>
                  </div>
                </div>

                {/* Card Agendar Cita */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow-lg"
                    style={cardBaseStyle}
                    onClick={() => setActiveTab("agendar")}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-body">
                      <FaCalendarAlt size={40} className="mb-3 text-success" />
                      <h5 className="card-title">Agendar Cita</h5>
                    </div>
                  </div>
                </div>

                {/* Card Atender Paciente */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow-lg"
                    style={cardBaseStyle}
                    onClick={() => setActiveTab("atender")}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-body">
                      <FaUserCheck size={40} className="mb-3 text-info" />
                      <h5 className="card-title">Atender Paciente</h5>
                    </div>
                  </div>
                </div>

                {/* Card Historial Atendidos */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow-lg"
                    style={cardBaseStyle}
                    onClick={() => setActiveTab("historial")}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-body">
                      <FaHistory size={40} className="mb-3 text-success" />
                      <h5 className="card-title">Historial</h5>
                    </div>
                  </div>
                </div>

                {/* Card Modificar Expediente */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow-lg"
                    style={cardBaseStyle}
                    onClick={() => setActiveTab("modificar")}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-body">
                      <FaEdit size={40} className="mb-3 text-warning" />
                      <h5 className="card-title">Editar Citas</h5>
                    </div>
                  </div>
                </div>

                {/* Card Lista Pacientes */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow-lg"
                    style={cardBaseStyle}
                    onClick={() => setActiveTab("listaPacientes")}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-body">
                      <FaListUl size={40} className="mb-3 text-secondary" />
                      <h5 className="card-title">Lista Espera</h5>
                    </div>
                  </div>
                </div>

                {/* Card Lista Doctores */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow-lg"
                    style={cardBaseStyle}
                    onClick={() => setActiveTab("listaDoctores")}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="card-body">
                      <FaUserMd size={40} className="mb-3 text-dark" />
                      <h5 className="card-title">Lista Doctores</h5>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Regresar al menú principal */}
        {activeTab !== "inicio" && (
          <div style={{ width: "100%" }}>
            <button
              className="btn btn-secondary mb-3"
              onClick={() => setActiveTab("inicio")}
            >
              <FaArrowLeft className="me-2" />
              Regresar al menú
            </button>
            {activeTab === "pacientes" && <PacienteForm />}
            {activeTab === "modificar" && <ModificarExpediente />}
            {activeTab === "listaPacientes" && <ListaPacientes />}
            {activeTab === "listaDoctores" && <ListaDoctores />}
            {activeTab === "agendar" && <AgendarCitaForm />}
            {activeTab === "atender" && <AtenderPaciente />}
            {activeTab === "historial" && <HistorialAtendidos />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: 16,
          textAlign: "center",
          opacity: 0.85,
          fontSize: 14,
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        © {new Date().getFullYear()} Hospital Vida
      </footer>
    </div>
  );
}
export default Home;