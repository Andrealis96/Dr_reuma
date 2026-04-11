import doctor from "../assets/doctor1.webp";
import expo1 from "../assets/expo1.webp";
import expo2 from "../assets/expo5.webp";
import expo3 from "../assets/expo6.webp";
import expo4 from "../assets/expo4.webp";
import "../styles/App.css";

function About() {

  const message = "Hola, solicito una consulta con el Dr.Reuma escribo de la pagina web. Mi nombre es ";
  const whatsappLink = `https://wa.me/5491128524979?text=${encodeURIComponent(message)}`;

  return (
    <section className="container about-section py-5" id="nosotros">

      {/* HEADER */}
      <div className="text-center">
        <h2 className=" subtitle-general mb-3">
          <span className="subtitle-celeste fw-bold">SOBRE EL </span>
          <span className="subtitle-negro fw-bold">ESPECIALISTA</span>
        </h2>

        <p className="text-muted fst-italic">
          Compromiso con el diagnóstico temprano y el tratamiento integral de enfermedades reumatológicas.
        </p>
      </div>


      {/* PERFIL DOCTOR */}
      <div className="row align-items-center g-4">

        {/* FOTO + TARJETA */}
        <div className="col-md-5">

          <div className="doctor-card text-center">

            <img
              src={doctor}
              alt="Dr Tony Vélez"
              className="img-fluid rounded mb-3 doctor-img"
            />

            <h5 className="fw-bold">
              DR. TONY VÉLEZ
            </h5>

            <p className="doctor-credentials fw-bold">
              UBA • Hospital Ramos Mejía <br />
              • Centro Gallego • Soc. Argentina de Reumatología
            </p>

            <p className="small text-muted fst-italic">
              Graduado en la Universidad de Buenos Aires (UBA) y formado en el
              Hospital Ramos Mejía (CABA).
            </p>

            <ul className="list-unstyled small text-muted text-start mt-3">
              <li>✔ Médico reumatólogo con amplia trayectoria</li>
              <li>✔ Especialista en enfermedades sistémicas y articulares</li>
              <li>✔ Experto en tratamiento del dolor</li>
              <li>✔ Médico y docente en el Centro Gallego de Buenos Aires</li>
              <li>✔ Miembro de la Sociedad Argentina de Reumatología</li>
              <li>✔ Miembro de la Sociedad Ecuatoriana de Reumatología</li>
            </ul>

          </div>

        </div>


        {/* TEXTO */}
        <div className="col-md-7">

          <h3 className=" doctor-credencial fw-bold mb-3">
            EXPERIENCIA Y ENFOQUE MÉDICO
          </h3>

          <p className="text-muted text-justify">
            El Dr. Tony Vélez es médico especialista en reumatología dedicado al
            diagnóstico, tratamiento y seguimiento de enfermedades articulares,
            autoinmunes y musculoesqueléticas.
          </p>

          <p className="text-muted text-justify">
            A lo largo de su trayectoria ha desarrollado un enfoque centrado en el
            paciente, priorizando el diagnóstico temprano, tratamientos
            personalizados y un acompañamiento médico continuo para mejorar la
            calidad de vida de cada persona.
          </p>

          <p className="text-muted text-justify">
            Además de su práctica clínica, participa activamente en congresos,
            actualizaciones médicas y espacios académicos donde comparte
            conocimientos con otros profesionales de la salud.
          </p>


          {/* BENEFICIOS */}
          <div className="row mt-4 g-3">

            <div className="col-6">
              <div className="feature-card">
                ✔ Diagnóstico temprano
              </div>
            </div>

            <div className="col-6">
              <div className="feature-card">
                ✔ Tratamientos personalizados
              </div>
            </div>

            <div className="col-6">
              <div className="feature-card">
                ✔ Atención profesional
              </div>
            </div>

            <div className="col-6">
              <div className="feature-card">
                ✔ Seguimiento médico continuo
              </div>
            </div>

          </div>


          {/* BOTON WHATSAPP */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-dark fw-bold mt-4 px-4"
          >
            Solicitar turno por WhatsApp
          </a>

        </div>

      </div>


      {/* EXPERIENCIA */}
      <div className="row text-center mt-5 trust-section">

        <div className="col-md-4">
          <h3 className="fw-bold text-success">+5</h3>
          <p>Años de experiencia</p>
        </div>

        <div className="col-md-4">
          <h3 className="fw-bold text-success">+1000</h3>
          <p>Pacientes atendidos</p>
        </div>

        <div className="col-md-4">
          <h3 className="fw-bold text-success">Actualización</h3>
          <p>Médica constante</p>
        </div>

      </div>


      {/* CONGRESOS */}
      <div className="mt-5">

        <div className="text-center mb-4">

          <h4 className="doctor-credencial fw-bold">
            PARTICIPACIÓN EN ACTUALIZACIONES MÉDICAS
          </h4>

          <p className="text-muted">
            Congresos, charlas médicas y formación continua en reumatología.
          </p>

        </div>


        <div className="row g-3">

          <div className="col-6 col-md-3">
            <div className="expo-img">
              <img src={expo1} className="img-fluid" alt="Congreso médico"/>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="expo-img">
              <img src={expo2} className="img-fluid" alt="Congreso médico"/>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="expo-img">
              <img src={expo3} className="img-fluid" alt="Congreso médico"/>
            </div>
          </div>

          <div className="col-6 col-md-3">
            <div className="expo-img">
              <img src={expo4} className="img-fluid" alt="Congreso médico"/>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
}

export default About;