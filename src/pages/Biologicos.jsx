
import { FaSyringe, FaFlask } from "react-icons/fa";

function Biologicos() {
  return (
    <div className="container py-4">
      <div
        style={{
          minHeight: "65vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: "18px",
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 24,
            background: "#e2f6fa",
            color: "#12b8cf",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 42,
          }}
        >
          <FaSyringe />
        </div>

        <h1
          style={{
            color: "#123b48",
            fontWeight: 900,
            margin: 0,
          }}
        >
          BIOLÓGICOS
        </h1>

        <div
          style={{
            background: "#12b8cf",
            color: "white",
            padding: "10px 24px",
            borderRadius: 12,
            fontWeight: 800,
          }}
        >
          PRÓXIMAMENTE
        </div>

        <p style={{ color: "#607580", maxWidth: 450 }}>
          Estamos preparando el módulo de tratamientos
          biológicos de Dr. Reuma.
        </p>
      </div>
    </div>
  );
}

export default Biologicos;
