import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";


function Home() {
  const [activeTab, setActiveTab] = useState("pacientes");
  const BG_URL = "https://hr.kenjo.io/hubfs/AdobeStock_224173795.jpg";

  // ---------------- FORM PACIENTE ----------------
  const [paciente, setPaciente] = useState({
    expediente: "",
    nombre: "",
    fechaNacimiento: "",
    edad: "",
    sintomas: "",
    urgencia: ""
  });

  const handlePacienteChange = (e) => {
  setPaciente({ ...paciente, [e.target.name]: e.target.value });
};

// 3️⃣ Modificar agregarPaciente para verificar expediente único
const agregarPaciente = async (e) => {
  e.preventDefault();

  if (!paciente.expediente) {
    alert("❌ Debes ingresar un número de expediente.");
    return;
  }

  try {
    const docRef = doc(db, "pacientes", paciente.expediente);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      alert("❌ Este número de expediente ya existe. Ingresa uno diferente.");
      return;
    }

    // Guardar paciente
    await setDoc(docRef, paciente);
    alert("✅ Paciente agregado en Firebase!");

    // Limpiar formulario
    setPaciente({ expediente: "", nombre: "", fechaNacimiento: "", edad: "", sintomas: "", urgencia: "" });
  } catch (e) {
    console.error("❌ Error:", e);
    alert("Error: revisa la consola");
  }
};


  // ---------------- FORM DOCTOR ----------------
  const [doctor, setDoctor] = useState({
    nombre: "",
    area: "",
    telefono: "",
    edificio: "",
    consultorio: ""
  });

  const handleDoctorChange = (e) => {
    setDoctor({ ...doctor, [e.target.name]: e.target.value });
  };

  const agregarDoctor = async (e) => {
    e.preventDefault();
    try {
      const doctorId = `${doctor.nombre}-${Date.now()}`;
      await setDoc(doc(db, "doctores", doctorId), doctor);
      alert("✅ Doctor agregado en Firebase!");
      setDoctor({ nombre: "", area: "", telefono: "", edificio: "", consultorio: "" });
    } catch (e) {
      console.error("❌ Error:", e);
      alert("Error: revisa la consola");
    }
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
          backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.45), rgba(0,0,0,.65)), url(${BG_URL})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          zIndex: -1,
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

    {/* Botón hamburguesa */}
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
            className={`nav-link btn btn-link ${activeTab === "pacientes" ? "active" : ""}`}
            onClick={() => setActiveTab("pacientes")}
            style={{ color: "#fff" }}
          >
            Pacientes
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link btn btn-link ${activeTab === "doctores" ? "active" : ""}`}
            onClick={() => setActiveTab("doctores")}
            style={{ color: "#fff" }}
          >
            Doctores
          </button>
        </li>
      </ul>
    </div>
  </div>
</nav>

      {/* Contenido centrado */}
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
        }}
      >
        <section
          style={{
            textAlign: "center",
            maxWidth: 880,
            background: "rgba(0,0,0,0.6)",
            padding: 20,
            borderRadius: 12,
            width: "100%",
          }}
        >
          {activeTab === "pacientes" && (
            <form onSubmit={agregarPaciente} style={{ textAlign: "left", maxWidth: 400, margin: "0 auto" }}>
              <h2 className="text-center mb-3">Formulario de Pacientes</h2>
              <input
  type="text"
  name="expediente"
  placeholder="Número de Expediente"
  className="form-control mb-2"
  value={paciente.expediente}
  onChange={handlePacienteChange}
  required
/>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre completo"
                className="form-control mb-2"
                value={paciente.nombre}
                onChange={handlePacienteChange}
                required
              />
              <input
                type="date"
                name="fechaNacimiento"
                className="form-control mb-2"
                value={paciente.fechaNacimiento}
                onChange={handlePacienteChange}
                required
              />
              <input
                type="number"
                name="edad"
                placeholder="Edad"
                className="form-control mb-2"
                value={paciente.edad}
                onChange={handlePacienteChange}
                required
              />
              <input
                type="text"
                name="sintomas"
                placeholder="Síntomas"
                className="form-control mb-2"
                value={paciente.sintomas}
                onChange={handlePacienteChange}
                required
              />
              <select
                name="urgencia"
                className="form-control mb-2"
                value={paciente.urgencia}
                onChange={handlePacienteChange}
                required
              >
                <option value="">Nivel de urgencia</option>
                <option value="1">Alta</option>
                <option value="2">Media</option>
                <option value="3">Baja</option>
              </select>
              <button type="submit" className="btn btn-primary w-100">
                Guardar Paciente
              </button>
            </form>
          )}

          {activeTab === "doctores" && (
            <form onSubmit={agregarDoctor} style={{ textAlign: "left", maxWidth: 400, margin: "0 auto" }}>
              <h2 className="text-center mb-3">Formulario de Doctores</h2>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre del Doctor"
                className="form-control mb-2"
                value={doctor.nombre}
                onChange={handleDoctorChange}
                required
              />
              <input
                type="text"
                name="area"
                placeholder="Área (ej: Cardiología)"
                className="form-control mb-2"
                value={doctor.area}
                onChange={handleDoctorChange}
                required
              />
              <input
                type="tel"
                name="telefono"
                placeholder="Teléfono"
                className="form-control mb-2"
                value={doctor.telefono}
                onChange={handleDoctorChange}
                required
              />
              <input
                type="text"
                name="edificio"
                placeholder="Edificio"
                className="form-control mb-2"
                value={doctor.edificio}
                onChange={handleDoctorChange}
                required
              />
              <input
                type="text"
                name="consultorio"
                placeholder="Número de consultorio"
                className="form-control mb-2"
                value={doctor.consultorio}
                onChange={handleDoctorChange}
                required
              />
              <button type="submit" className="btn btn-success w-100">
                Guardar Doctor
              </button>
            </form>
          )}
        </section>
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
