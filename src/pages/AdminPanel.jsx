import { Link } from "react-router-dom";

import {
  FaUserInjured,
  FaComments,
  FaFlask,
  FaCalendarAlt,
  FaShieldAlt,
  FaChevronRight,
} from "react-icons/fa";

function AdminPanel() {
  const adminItems = [
    {
      title: "Historias Clínicas",
      description: "Pacientes, evoluciones médicas y PDF.",
      icon: <FaUserInjured />,
      path: "/admin/historias",
      className: "admin-modern-historias",
    },
    {
      title: "Comentarios",
      description: "Gestionar testimonios y respuestas.",
      icon: <FaComments />,
      path: "/admin/comentarios",
      className: "admin-modern-comentarios",
    },
    {
      title: "Laboratorios",
      description: "Órdenes, estudios y solicitudes.",
      icon: <FaFlask />,
      path: "/admin/laboratorios",
      className: "admin-modern-laboratorios",
    },
    {
      title: "Agenda de citas",
      description: "Turnos, bloqueos y notas del día.",
      icon: <FaCalendarAlt />,
      path: "/admin/citas",
      className: "admin-modern-citas",
    },
  ];

  return (
    <section className="admin-modern-section">
      <div className="container py-5">

        <div className="admin-modern-header mb-5">

          <div>
            <div className="admin-modern-badge">
              <FaShieldAlt />
              Área privada
            </div>

            <h2 className="subtitle-general text-start mb-2">
              <span className="subtitle-celeste">PANEL</span>{" "}
              <span className="subtitle-negro">ADMINISTRATIVO</span>
            </h2>

            <p>
              Gestión interna de pacientes, agenda, comentarios y laboratorios
              de Dr. Reuma.
            </p>
          </div>

          <div className="admin-modern-logo-box">
            DR. REUMA
          </div>

        </div>

        <div className="row g-4">

          {adminItems.map((item, index) => (
            <div className="col-12 col-md-6" key={index}>
              <Link to={item.path} className="admin-modern-link">

                <div className={`admin-modern-card ${item.className}`}>

                  <div className="admin-modern-icon">
                    {item.icon}
                  </div>

                  <div className="admin-modern-content">
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                  </div>

                  <div className="admin-modern-arrow">
                    <FaChevronRight />
                  </div>

                </div>

              </Link>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}

export default AdminPanel;