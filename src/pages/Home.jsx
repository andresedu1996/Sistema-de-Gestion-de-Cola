import React, { useState } from "react";
import ListaPacientes from "./ListaPacientes";
import ListaDoctores from "./ListaDoctores";
import PacienteForm from "./PacienteForm";
import ModificarExpediente from "./ModificarExpediente"; // 👈 nuevo

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
      {/* Imagen de fondo para todas las pantallas */}
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

      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            Hospital Vida
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${
                    activeTab === "inicio" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("inicio")}
                  style={{ color: "#fff" }}
                >
                  Inicio
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${
                    activeTab === "pacientes" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("pacientes")}
                  style={{ color: "#fff" }}
                >
                  Crear Expediente
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${
                    activeTab === "modificar" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("modificar")}
                  style={{ color: "#fff" }}
                >
                  Modificar Expediente {/* 👈 nueva opción */}
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${
                    activeTab === "listaPacientes" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("listaPacientes")}
                  style={{ color: "#fff" }}
                >
                  Lista Espera
                </button>
              </li>

              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${
                    activeTab === "listaDoctores" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("listaDoctores")}
                  style={{ color: "#fff" }}
                >
                  Lista Doctores
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Contenido */}
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
        }}
      >
        {activeTab === "inicio" && (
          <h1 style={{ textAlign: "center" }}>🏥 Bienvenido a Hospital Vida</h1>
        )}

        {activeTab === "pacientes" && <PacienteForm />}
        {activeTab === "modificar" && <ModificarExpediente />} {/* 👈 render */}
        {activeTab === "listaPacientes" && <ListaPacientes />}
        {activeTab === "listaDoctores" && <ListaDoctores />}
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