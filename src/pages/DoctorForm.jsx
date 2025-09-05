// DoctorForm.jsx
import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function DoctorForm() {
  const [form, setForm] = useState({
    nombre: "",
    area: "",
    telefono: "",
    edificio: "",
    consultorio: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const agregarDoctor = async (e) => {
    e.preventDefault();
    try {
      // Generamos un ID único automático con el nombre + timestamp
      const doctorId = `${form.nombre}-${Date.now()}`;
      await setDoc(doc(db, "doctores", doctorId), form);

      alert("✅ Doctor agregado en Firebase!");
      setForm({ nombre: "", area: "", telefono: "", edificio: "", consultorio: "" });
    } catch (e) {
      console.error("❌ Error:", e);
      alert("Error: revisa la consola");
    }
  };

  return (
    <div>
      <h2>Agregar Doctor</h2>
      <form onSubmit={agregarDoctor}>
        <input
          type="text"
          name="nombre"
          placeholder="Nombre del Doctor"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="area"
          placeholder="Área (ej: Cardiología)"
          value={form.area}
          onChange={handleChange}
          required
        />
        <input
          type="tel"
          name="telefono"
          placeholder="Teléfono"
          value={form.telefono}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="edificio"
          placeholder="Edificio"
          value={form.edificio}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="consultorio"
          placeholder="Número de consultorio"
          value={form.consultorio}
          onChange={handleChange}
          required
        />
        <button type="submit">Agregar Doctor</button>
      </form>
    </div>
  );
}

export default DoctorForm;
