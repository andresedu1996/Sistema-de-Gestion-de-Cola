![Estado del Proyecto](https://img.shields.io/badge/ESTADO-COMPLETO-brightgreen)
![Asignatura](https://img.shields.io/badge/Estructura_de_Datos-Proyecto-blue)
![Tipo](https://img.shields.io/badge/Tipo-App__Web-informational)
![Interfaz](https://img.shields.io/badge/Interfaz-Web-success)
![Estructuras](https://img.shields.io/badge/Estructuras-Firestore__%7C__Ordenaci%C3%B3n__por__prioridad__%7C__Lista__doblemente__enlazada-6f42c1)
![Validación](https://img.shields.io/badge/Validaci%C3%B3n-Entradas_y_Errores-important)
![Licencia](https://img.shields.io/badge/Licencia-MIT-lightgrey)

# Sistema de Gestión de Cola

### Proyecto de la clase de Estructura de Datos

Aplicación web (Vite + React) para gestionar pacientes, doctores y citas con **lista de espera por prioridad** en tiempo real usando **Firebase Firestore**. Permite **registrar pacientes**, **agendar citas**, **listar y ordenar por prioridad/fecha**, **editar/atender citas**, y consultar un **historial de atendidos** implementado con **lista doblemente enlazada**, con **validación** en formularios.

---

## Características Principales

- ✅ **Registro de pacientes**  
  Nombre, Fecha de nacimiento, Edad, Ciudad y Dirección. El Nº de expediente se genera automáticamente (contador en `counters/pacientes`).

- 🗓️ **Agendar citas**  
  Búsqueda por expediente o nombre; selección de Área, Doctor, Fecha y Horario disponible; campos de Síntomas, Motivo y Prioridad (alta/media/baja). Guarda en `citas` con estado `en_espera`.

- 🧭 **Lista de espera por prioridad**  
  Vista en tiempo real de `citas` con estado `en_espera`, fusionada con datos de `pacientes`. Ordenada por prioridad (alta > media > baja) y fecha/hora.

- ✏️ **Editar/atender citas**  
  Edición de síntomas, motivo y prioridad; opción para marcar como atendido (estado `atendido`).

- 🩺 **Listado de doctores**  
  Carga desde la colección `doctores` (o predeterminados), con foto, área, contacto, ubicación y horarios.

- 🕘 **Historial de atendidos**  
  Vista dedicada con navegación tipo anterior/siguiente basada en **lista doblemente enlazada** sobre las citas con estado `atendido` (ordenadas por fecha de atención). Incluye búsqueda y filtro por prioridad.

- 🎨 **UI y estilos**  
  React + Bootstrap 5 + React Icons.

- 🛡️ **Validación**  
  Formularios con campos obligatorios y manejo básico de errores.

---

## Tecnologías 

- **Framework/Lenguaje:** React 19 + Vite 7.  
- **Estilos:** Bootstrap 5 · React Icons.  
- **Persistencia:** Firebase Firestore.

> Configura variables de entorno `VITE_FIREBASE_*` para conectar con tu proyecto de Firebase.

---

## Requisitos

- **Datos mínimos por paciente:** Nombre, Fecha de Nacimiento, Edad, Ciudad, Dirección. Nº de expediente autogenerado (6 dígitos).  
- **Operaciones:** Registrar paciente · Agendar cita · Mostrar lista por prioridad · Editar/Atender cita · Listar doctores · Historial de atendidos.  
- **Interfaz:** GUI web (Vite + React).  
- **Calidad:** Validaciones en formularios y manejo básico de errores.

---

## Estructuras de Datos

- **Firestore (colecciones):** `pacientes`, `citas`, `doctores`, `counters/pacientes`.  
- **Lista de espera:** ordenación en cliente por prioridad (alta > media > baja) y fecha/hora.  
- **Historial:** estructura en memoria con **lista doblemente enlazada** para recorrer pacientes atendidos (más reciente ⇄ más antiguo).  
- **Estados de cita:** `en_espera` → `atendido` con marcas de tiempo (`createdAt`, `fechaAtencion`).

---

## Cómo Ejecutar

1. **Clona** este repositorio.  
2. **Instala y configura**: instala dependencias; define variables `VITE_FIREBASE_*` en `.env.local` (opcional: ejecuta `node seedDoctores.js` para poblar doctores).  

  Variables esperadas (Firebase):

  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MEASUREMENT_ID`

3. **Ejecuta** la app de desarrollo y navega el flujo: Crear Expediente → Agendar Cita → Lista de Espera → Editar/Atender → Historial.

  Scripts útiles:

  - Desarrollo: `npm run dev`
  - Lint: `npm run lint`
  - Compilar: `npm run build`
  - Preview producción: `npm run preview`

> Requiere conexión a Firestore: define `VITE_FIREBASE_*` antes de ejecutar.

