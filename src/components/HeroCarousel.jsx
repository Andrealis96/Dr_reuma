import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

// DESKTOP
import img1 from "../assets/banner1.webp";
import img2 from "../assets/banner2.webp";
import img3 from "../assets/banner3.webp";
import img4 from "../assets/banner4.webp";
import img5 from "../assets/banner5.webp";

// MOBILE
import m1 from "../assets/bannertelef1.webp";
import m2 from "../assets/bannertelef2.webp";
import m3 from "../assets/bannertelef3.webp";
import m4 from "../assets/bannertelef4.webp";
import m5 from "../assets/bannertelef5.webp";

const desktopImages = [img1, img2, img3, img4, img5];
const mobileImages = [m1, m2, m3, m4, m5];

function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  const images = isMobile
    ? mobileImages
    : desktopImages;

  // Detectar celular / escritorio
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  // Cambio automático
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) =>
        prev === images.length - 1
          ? 0
          : prev + 1
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [images.length]);

  const anterior = () => {
    setIndex((prev) =>
      prev === 0
        ? images.length - 1
        : prev - 1
    );
  };

  const siguiente = () => {
    setIndex((prev) =>
      prev === images.length - 1
        ? 0
        : prev + 1
    );
  };

  return (
    <section className="hero hero-home">

      {/* TODAS LAS IMÁGENES QUEDAN CARGADAS */}
      <div className="hero-images-stack">

        {images.map((imagen, i) => (
          <img
            key={i}
            src={imagen}
            alt="Reumatólogo en Neuquén - Dr. Reuma"
            className={`hero-img hero-stack-img ${
              i === index
                ? "hero-stack-img-active"
                : ""
            }`}
            draggable="false"
          />
        ))}

      </div>

      {/* FLECHA IZQUIERDA */}
      <button
        type="button"
        className="hero-arrow hero-arrow-left"
        onClick={anterior}
        aria-label="Imagen anterior"
      >
        <FaChevronLeft />
      </button>

      {/* FLECHA DERECHA */}
      <button
        type="button"
        className="hero-arrow hero-arrow-right"
        onClick={siguiente}
        aria-label="Siguiente imagen"
      >
        <FaChevronRight />
      </button>

      {/* INDICADORES */}
      <div className="hero-dots">

        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            className={
              i === index
                ? "dot active"
                : "dot"
            }
            onClick={() => setIndex(i)}
            aria-label={`Ir a imagen ${i + 1}`}
          />
        ))}

      </div>

    </section>
  );
}

export default HeroCarousel;