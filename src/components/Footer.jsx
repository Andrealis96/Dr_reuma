import { FaInstagram, FaFacebook, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <section className="footer-section">
      <footer className="text-light py-3">

        <div className="container text-center">

          {/* LOGO */}
          <div className="mb-3">
            <img
              src="/DrReumaLogo.svg"
              alt="Dr Reuma"
              height="100"
            />
          </div>

          {/* REDES */}
          <div className="d-flex justify-content-center gap-4 fs-4 mb-3">

            <a
              href="https://www.instagram.com/drreuma?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="text-light"
            >
              <FaInstagram />
            </a>

            <a
              href="https://www.facebook.com/profile.php?id=61585981370318"
              target="_blank"
              rel="noopener noreferrer"
              className="text-light"
            >
              <FaFacebook />
            </a>

            <a
              href="mailto:tonygregoryvelez@yahoo.com"
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