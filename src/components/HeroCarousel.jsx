import { useEffect, useState } from "react";

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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);

    const interval = setInterval(() => {
      setIndex((prev) =>
        prev === desktopImages.length - 1 ? 0 : prev + 1
      );
    }, 4500);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, []);

  const images = isMobile ? mobileImages : desktopImages;

  return (
    <section className="hero">
      <img
        src={images[index]}
        alt="Banner"
        className="hero-img"
      />

      {/* indicadores */}
      <div className="hero-dots">
        {images.map((_, i) => (
          <span
            key={i}
            className={i === index ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroCarousel;