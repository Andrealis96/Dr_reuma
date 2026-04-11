
import "../styles/App.css";
import esclerodermiaImg from "../assets/esclerodermiaa.webp";
import rodillaImg from "../assets/rodilla.webp";
import dermatomiositisImg from "../assets/dermatomiositiss.webp";
import lupusImg from "../assets/lupuss.webp";
import protesisImg from "../assets/protesis.webp";
import gotaImg from "../assets/gotaa.webp";
import osteoporosisImg from "../assets/osteoporosiss.webp";
import fibromialgiaImg from "../assets/fibromialgiaa.webp";
import gotavideo from "../assets/gotavideo.mp4";
import esclerodermiavideo from "../assets/esclerodermiavideo.mp4";
import artritisvideo from "../assets/artritisreumavideo.mp4";

function Galeria() {
  const items = [
    {
      type: "video",
      src: gotavideo,
      title: "ARTITIS REMAUTOIDE",
    },
    {
      type: "video",
      src: esclerodermiavideo,
      title: "ESCLERODERMIA",
    },
    {
      type: "video",
      src: artritisvideo,
      title: "ARTRITIS REUMATOIDE",
    },
    {
      type: "image",
      src: esclerodermiaImg,
      title: "ESCLERODERMIA",
    },
    {
      type: "image",
      src: rodillaImg,
      title: "DOLOR DE RODILLA",
    },
    {
      type: "image",
      src: dermatomiositisImg,
      title: "DERMATOMIOSITIS",
    },
    {
      type: "image",
      src: lupusImg,
      title: "LUPUS",
    },
    {
      type: "image",
      src: protesisImg,
      title: "ARTOSIS AVANZADA DE RODILLA QUE LLEGA A PRÓTESIS",
    },
    {
      type: "image",
      src: gotaImg,
      title: "PIE DE GOTA",
    },
    {
      type: "image",
      src: osteoporosisImg,
      title: "MÚLTIPLES FRACTURAS POR OSTEOPOROSIS",
    },
    {
      type: "image",
      src: fibromialgiaImg,
      title: "FIBROMIALGIA TRATABLE",
    },
  ];

  return (
    <section className="galeria" id="galeriaa">
      <h2 className="subtitle-general mb-5">
        <span className="subtitle-celeste">GALERÍA DE </span>
        <span className="subtitle-negro">CASOS</span>
        </h2>
      <div className="galeria-grid">
        {items.map((item, index) => (
            <div className="galeria-card" key={index}>
            
            {item.type === "video" ? (
              <video
                  className="galeria-media"
                  src={item.src}
                  controls
                  preload="metadata"
                  muted
                />
            ) : (
                <img
                className="galeria-media "
                src={item.src}
                alt={item.title}
                />
            )}

            <p className="galeria-caption">{item.title}</p>

          </div>
        ))}
      </div>
       
    </section>
  );
}

export default Galeria;