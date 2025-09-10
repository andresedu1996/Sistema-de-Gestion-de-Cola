import React, { useState } from "react";
import { FaUserPlus, FaEdit, FaListUl, FaUserMd, FaCalendarAlt, FaArrowLeft } from "react-icons/fa"; 
import ListaPacientes from "./ListaPacientes";
import ListaDoctores from "./ListaDoctores";
import PacienteForm from "./PacienteForm";
import ModificarExpediente from "./ModificarExpediente";
import Citas from "./Citas"; // <-- Importa la nueva pantalla

function Home() {
  const [activeTab, setActiveTab] = useState("inicio");

  const BG_URL =
    "https://international.quironsalud.com/es/hospitales/hospitales-referencia.ficheros/3348740-Hospitals-in-Spain.jpg";

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
            <h1 className="mb-4">🏥 Bienvenido a Hospital Vida</h1>
            <div className="container">
              <div className="row justify-content-center g-4">
                {/* Card Crear Expediente */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("pacientes")}
                  >
                    <div className="card-body">
                      <FaUserPlus size={40} className="mb-3 text-primary" />
                      <h5 className="card-title">Crear Expediente</h5>
                    </div>
                  </div>
                </div>

                {/* Card Modificar Expediente */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("modificar")}
                  >
                    <div className="card-body">
                      <FaEdit size={40} className="mb-3 text-warning" />
                      <h5 className="card-title">Modificar Expediente</h5>
                    </div>
                  </div>
                </div>

                {/* Card Lista Pacientes */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("listaPacientes")}
                  >
                    <div className="card-body">
                      <FaListUl size={40} className="mb-3 text-success" />
                      <h5 className="card-title">Lista Espera</h5>
                    </div>
                  </div>
                </div>

                {/* Card Lista Doctores */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("listaDoctores")}
                  >
                    <div className="card-body">
                      <FaUserMd size={40} className="mb-3 text-info" />
                      <h5 className="card-title">Lista Doctores</h5>
                    </div>
                  </div>
                </div>

                {/* Card Asignar Cita */}
                <div className="col-md-3">
                  <div
                    className="card text-center h-100 shadow"
                    style={{ cursor: "pointer" }}
                    onClick={() => setActiveTab("citas")}
                  >
                    <div className="card-body">
                      <FaCalendarAlt size={40} className="mb-3 text-danger" />
                      <h5 className="card-title">Asignar Cita</h5>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Otras pantallas con botón de regreso */}
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
            {activeTab === "citas" && <Citas />} {/* <-- Nueva pantalla */}
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
