import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

const USE_FIREBASE = true;

const images = import.meta.glob(
  "/src/assets/doctores/*.{png,PNG,jpg,JPG,jpeg,JPEG,webp,WEBP,svg,SVG}",
  { eager: true, as: "url" }
);

const imageMap = Object.fromEntries(
  Object.entries(images).map(([path, url]) => {
    const file = path.split("/").pop();
    return [file.toLowerCase(), url];
  })
);

if (import.meta.env.DEV) {
  console.group("[ListaDoctores] Archivos detectados en /src/assets/doctores");
  Object.keys(imageMap).forEach((k) =>
    console.log(" -", k, "->", imageMap[k])
  );
  console.groupEnd();
}

const defaultAvatar =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
      <defs>
        <linearGradient id='g' x1='0' x2='0' y1='0' y2='1'>
          <stop offset='0%' stop-color='#2a2a2a'/>
          <stop offset='100%' stop-color='#1a1a1a'/>
        </linearGradient>
      </defs>
      <rect width='128' height='128' fill='url(#g)'/>
      <circle cx='64' cy='46' r='22' fill='#ffffff'/>
      <path d='M16 118c6-26 28-38 48-38s42 12 48 38' fill='#ffffff'/>
    </svg>
  `);

const slugify = (str = "") =>
  str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const DOCTORES_PREDETERMINADOS = [
  {
    id: "dp-001",
    nombre: "Juan Pérez",
    area: "Cardiología",
    telefono: "9999-0001",
    edificio: "Torre A",
    consultorio: "A-203",
    foto: "default.png",
  },
  {
    id: "dp-002",
    nombre: "María Gómez",
    area: "Pediatría",
    telefono: "9999-0002",
    edificio: "Torre B",
    consultorio: "B-105",
    foto: "default.png",
  },
  {
    id: "dp-003",
    nombre: "Carlos Ramírez",
    area: "Dermatología",
    telefono: "9999-0003",
    edificio: "Torre A",
    consultorio: "A-310",
    foto: "default.png",
  },
];

function getImageForDoctor({ nombre, id, foto }) {
  if (foto) {
    const key = typeof foto === "string" ? foto.toLowerCase() : foto;

    const hitByFoto = imageMap[key];
    if (hitByFoto) return hitByFoto;

    if (typeof foto === "string" && /^https?:\/\//i.test(foto)) return foto;

    if (
      typeof foto === "string" &&
      (foto.startsWith("/assets/") || foto.startsWith("assets/"))
    ) {
      return foto.startsWith("/") ? foto : `/${foto}`;
    }

    if (typeof foto === "string" && !foto.includes("/")) {
      return `/assets/doctores/${foto}`;
    }
  }

  const base = slugify(nombre || "");
  const candidates = [
    `${base}.jpg`,
    `${base}.jpeg`,
    `${base}.png`,
    `${base}.webp`,
    `${base}.svg`,
    id ? `${id}.jpg` : null,
    id ? `${id}.jpeg` : null,
    id ? `${id}.png` : null,
    id ? `${id}.webp` : null,
    id ? `${id}.svg` : null,
    "default.jpg",
    "default.jpeg",
    "default.png",
    "default.webp",
    "default.svg",
  ].filter(Boolean);

  for (const file of candidates) {
    const hit = imageMap[file.toLowerCase()];
    if (hit) return hit;
  }

  return defaultAvatar;
}

function ListaDoctores() {
  const [doctores, setDoctores] = useState([]);

  useEffect(() => {
    (async () => {
      let base = [...DOCTORES_PREDETERMINADOS];

      if (USE_FIREBASE) {
        try {
          const querySnapshot = await getDocs(collection(db, "doctores"));
          const fromFb = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          if (fromFb.length > 0) {
            const byId = new Map(base.map((d) => [d.id, d]));
            const byName = new Map(base.map((d) => [slugify(d.nombre), d]));

            for (const fb of fromFb) {
              const keyId = fb.id;
              const keyName = slugify(fb.nombre || "");
              const existsById = byId.get(keyId);
              const existsByName = byName.get(keyName);

              if (existsById) {
                byId.set(keyId, {
                  ...existsById,
                  ...fb,
                  foto: existsById.foto ?? fb.foto,
                });
              } else if (existsByName) {
                const old = existsByName;
                const merged = { ...old, ...fb, foto: old.foto ?? fb.foto };
                byId.set(merged.id, merged);
              } else {
                byId.set(keyId, fb);
              }
            }
            base = Array.from(byId.values());
          }
        } catch (e) {
          console.warn("No se pudo cargar desde Firebase, usando lista local:", e);
        }
      }

      setDoctores(base);

      if (import.meta.env.DEV) {
        console.group("[ListaDoctores] Resolución de imágenes");
        base.forEach((d) => {
          const resolved = getImageForDoctor(d);
          console.log(d.nombre, "-> foto:", d.foto, "=>", resolved);
        });
        console.groupEnd();
      }
    })();
  }, []);

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column">
      <h2 className="text-center my-4">Listado de Doctores</h2>

      <div className="row flex-grow-1">
        {doctores.map((d) => (
          <div
            key={d.id}
            className="col-12 col-sm-6 col-md-4 col-lg-3 d-flex align-items-stretch"
          >
            <div className="card bg-dark text-light mb-4 shadow-sm w-100">
              {}
              <div className="ratio ratio-4x3 bg-black">
                <img
                  src={getImageForDoctor(d)}
                  alt={`Foto de ${d.nombre || "doctor/a"}`}
                  className="w-100 h-100"
                  style={{ objectFit: "contain" }}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
              </div>

         <div className="card-body d-flex flex-column">
  <h5 className="card-title mb-2">{d.nombre}</h5>
  <p className="card-text mb-2 flex-grow-1">
    <strong>Área:</strong> {d.area || "—"} <br />
    <strong>Teléfono:</strong> {d.telefono || "—"} <br />
    <strong>Edificio:</strong> {d.edificio || "—"} <br />
    <strong>Consultorio:</strong> {d.consultorio || "—"}
  </p>

{d.horarios && d.horarios.length > 0 && (
  <div className="mt-2">
    <strong>Horario:</strong>
    <p className="ms-2">
      🕒 {d.horarios[0].split(" - ")[0]} - {d.horarios[d.horarios.length - 1].split(" - ")[1]}
    </p>
  </div>
)}
</div>
            </div>
          </div>
        ))}

        {doctores.length === 0 && (
          <div className="col-12">
            <div className="alert alert-warning text-center">
              No hay doctores para mostrar.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListaDoctores;