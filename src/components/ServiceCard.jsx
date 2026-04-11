import { FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";

function ServiceCard({ title, description, message, disabled, badge, mapLink, showButton= true}) {
  const phoneNumber = "5492994666559";

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <div className="service-card-wrapper animate-fade-up">
      {badge && <span className="service-badge">{badge}</span>}

      <div className={`card service-card h-100 ${disabled ? "disabled" : ""}`}>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title fw-bold">{title}</h5>
          <p className="card-text text-muted">{description}</p>

          {!disabled && showButton && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark fw-bold mt-auto d-flex align-items-center justify-content-center gap-2"
            >
              <FaWhatsapp size={18} />
              Contactar por WhatsApp
            </a>
          )}
          {mapLink && (
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark fw-bold mt-2 d-flex align-items-center justify-content-center gap-2"
            >
              <FaMapMarkerAlt size={18} />
              Ver ubicación
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default ServiceCard;
