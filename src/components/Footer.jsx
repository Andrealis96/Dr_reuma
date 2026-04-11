import { useNavigate } from "react-router-dom";
import { FaInstagram, FaFacebook, FaEnvelope, FaHome, FaBriefcase, FaCommentDots, FaUser, FaImages } from "react-icons/fa";
import DrReumaLogo from "../assets/DrReumaLogo.svg";

function Footer() {

  const navigate = useNavigate();

  const goToSection = (section) => {
    navigate(`/#${section}`);
  };

  return (
    <section className="footer-section">
      <footer className="text-light py-3">

        <div className="container">

          <div className="d-flex align-items-start gap-4 mb-2">

            {/* LOGO */}
            <img
              src={DrReumaLogo}
              alt="Dr Reuma"
              height="120"
            />

            {/* NAVEGACIÓN */}
            <div>

              <h6 className="fw-bold mb-3">
                Navegación
              </h6>

              <ul className="footer-list">

                <li>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/")}
                  >
                    <FaHome className="me-2"/> Inicio
                  </span>
                </li>

                <li>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => goToSection("servicios")}
                  >
                    <FaBriefcase className="me-2"/> Servicios
                  </span>
                </li>
                <li>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => goToSection("galeriaa")}
                  >
                    <FaImages className="me-2"/> Galeria
                  </span>
                </li>
                <li>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => goToSection("testimonios")}
                  >
                    <FaCommentDots className="me-2"/> Testimonios
                  </span>
                </li>

                <li>
                  <span
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate("/about")}
                  >
                    <FaUser className="me-2"/> Nosotros
                  </span>
                </li>

              </ul>

            </div>

          </div>


          {/* REDES */}
          <div className="d-flex gap-4 fs-4 mb-3">

            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light"
            >
              <FaInstagram />
            </a>

            <a
              href="https://facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light"
            >
              <FaFacebook />
            </a>

            <a
              href="mailto:tonygregoryvelez@gmail.com"
              className="text-light"
            >
              <FaEnvelope />
            </a>

          </div>


          {/* COPYRIGHT */}
          <p className="mb-0">
            © {new Date().getFullYear()} Dr. Reuma · Tony Gregory Vélez Macías
          </p>

        </div>

      </footer>
    </section>
  );
}

export default Footer;