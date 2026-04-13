import { motion } from "framer-motion"
import { FaHeartbeat, FaUserMd, FaClipboardCheck } from "react-icons/fa"

import paciente1 from "../assets/paciente1.webp"
import paciente2 from "../assets/paciente2.webp"
import paciente3 from "../assets/paciente3.webp"
import paciente4 from "../assets/paciente4.webp"
import paciente5 from "../assets/paciente5.webp"
import "../styles/App.css"

const benefits = [
  { icon: <FaUserMd />, text: "ATENCIÓN PERSONALIZADA" },
  { icon: <FaClipboardCheck />, text: "DIAGNÓSTICO PRECISO" },
  { icon: <FaHeartbeat />, text: "SEGUIMIENTO CONTINUO" }
]

const images = [
  paciente1,
  paciente2,
  paciente3,
  paciente4,
  paciente5
]

function Welcome() {
  return (
    <section className="welcome-section py-5">
      <div className="container">
        <h1 className="title-general  text-center fly-text mb-5">
          <span className="title-celeste">BIENVENIDO A  </span>
          <span className="title-negro"> DR.REUMA</span>
        </h1>
        <div className="row align-items-center">

          {/* TEXTO */}

          <motion.div
            className="col-md-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >

            <p className="welcome-text">
              En Dr. Reuma trabajamos para que vuelvas a moverte sin dolor.
              Brindamos atención reumatológica integral con diagnóstico preciso
              y tratamientos orientados a mejorar tu calidad de vida.
              <br /><br />
               Acá no sos un número: sos una persona.
            </p>

            <div className="benefits mt-4">

              {benefits.map((item, index) => (

                <motion.div
                  key={index}
                  className="benefit-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                >

                  <span className="benefit-icon">
                    {item.icon}
                  </span>

                  <span>{item.text}</span>

                </motion.div>

              ))}

            </div>

          </motion.div>


          {/* SLIDER */}

          <div className="col-md-6">

            <div className="image-slider">

              <div className="slider-track">

                {[...images, ...images].map((img, i) => (

                  <div className="slide" key={i}>

                    <img src={img} alt="Paciente Dr Reuma" loading="lazy" />

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  )
}

export default Welcome