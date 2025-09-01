export default function Home() {
  const BG_URL = "https://hr.kenjo.io/hubfs/AdobeStock_224173795.jpg";

  return (
    <div
      style={{
        height: "100svh",
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
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
        }}
      >
        <a
          href="#"
          style={{ fontWeight: 800, textDecoration: "none", color: "inherit" }}
        >
          Hospital Vida
        </a>
        <nav style={{ display: "flex", gap: 12 }}>
          <a
            href="#doctores"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Doctores
          </a>
          <a href="#citas" style={{ color: "inherit", textDecoration: "none" }}>
            Citas
          </a>
        </nav>
      </header>

      {/* Contenido centrado */}
      <main
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
        }}
      >
        <section style={{ textAlign: "center", maxWidth: 880 }}>
          <h1
            style={{
              fontSize: "clamp(28px, 6vw, 56px)",
              lineHeight: 1.1,
              margin: "0 0 10px",
            }}
          >
            Tu salud es primero
          </h1>
          <p
            style={{
              fontSize: "clamp(16px, 2.2vw, 20px)",
              opacity: 0.95,
              margin: 0,
            }}
          >
            Agenda tu cita en minutos y conoce a nuestros especialistas
          </p>
        </section>
      </main>

      {/* Footer*/}
      <footer
        style={{
          padding: 16,
          textAlign: "center",
          opacity: 0.85,
          fontSize: 14,
        }}
      >
        © {new Date().getFullYear()} Hospital Vida
      </footer>
    </div>
  );
}
