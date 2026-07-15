import { FaInstagram } from "react-icons/fa";

import artritis from "../assets/artritis.webp";
import lupus from "../assets/lupus.webp";
import dolorrodillas from "../assets/dolorrodillas.webp";

function InstagramPreview() {
  return (
    <section className="instagram-diagnosticos-section">
      <div className="container">

        <div className="instagram-preview-card">

          <div className="instagram-preview-top">
            <FaInstagram />
            <span>Instagram</span>
          </div>

          <div className="instagram-preview-profile">

            <div className="instagram-preview-avatar">
              <img
                src="src/assets/AssitenteDoctor.svg"
                alt="Dr. Reuma Instagram"
              />
            </div>

            <div className="instagram-preview-info">
              <h3>@drreuma</h3>

              <div className="instagram-preview-stats">
                <div>
                  <strong>Tips</strong>
                  <span>Reuma</span>
                </div>

                <div>
                  <strong>Info</strong>
                  <span>Médica</span>
                </div>

                <div>
                  <strong>Salud</strong>
                  <span>Autoinmune</span>
                </div>
              </div>
            </div>

          </div>

          <div className="instagram-preview-bio">
            <h4>Dr. Reuma | Reumatólogo en Neuquén</h4>

            <p>
              En mi Instagram podrás ver tips, información médica sencilla,
              recomendaciones y contenido educativo sobre enfermedades
              reumatológicas, dolor articular, artritis, lupus, artrosis,
              fibromialgia, osteoporosis, gota y salud autoinmune.
            </p>
          </div>

          <div className="instagram-preview-grid">

            <div className="instagram-preview-post">
              <img
                src={artritis}
                alt="Artritis reumatoide Dr. Reuma"
              />
              <span>Artritis</span>
            </div>

            <div className="instagram-preview-post">
              <img
                src={lupus}
                alt="Lupus Dr. Reuma"
              />
              <span>Lupus</span>
            </div>

            <div className="instagram-preview-post">
              <img
                src={dolorrodillas}
                alt="Dolor articular Dr. Reuma"
              />
              <span>Dolor articular</span>
            </div>

          </div>

          <a
            href="https://www.instagram.com/drreuma"
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-preview-btn"
          >
            <FaInstagram className="me-2" />
            Ver perfil en Instagram
          </a>

        </div>

      </div>
    </section>
  );
}

export default InstagramPreview;