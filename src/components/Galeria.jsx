
import "../styles/App.css";
import esclerodermiaImg from "../assets/esclerodermiaa.webp";
import rodillaImg from "../assets/rodilla.webp";
import gotavideo from "../assets/gotavideo.mp4";
import esclerodermiavideo from "../assets/esclerodermiavideo.mp4";
import artritisvideo from "../assets/artritisreumavideo.mp4";

function Galeria() {
  const items = [
    {
      type: "video",
      src: gotavideo,
      title: "GOTA",
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