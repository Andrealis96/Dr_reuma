import Carousel from 'react-bootstrap/Carousel'
import img1 from '../assets/banner1.webp'
import img2 from '../assets/banner2.webp'
import img3 from '../assets/banner3.webp'
import img4 from '../assets/banner4.webp'
import img5 from '../assets/banner5.webp'

function HeroCarousel() {
    return (
        <Carousel fade interval={4500} controls indicators className="hero-carousel">
        
            <Carousel.Item>
                <img
                className="d-block w-100 hero-img"
                src={img1}
                alt="Atención en reumatología"
                loading="eager"
                />
            </Carousel.Item>

            <Carousel.Item>
                <img
                className="d-block w-100 hero-img"
                src={img2}
                alt="Diagnóstico preciso"
                />
            </Carousel.Item>

            <Carousel.Item>
                <img
                className="d-block w-100 hero-img"
                src={img3}
                alt="Tratamientos personalizados"
                />
            </Carousel.Item>

            <Carousel.Item>
                <img
                className="d-block w-100 hero-img"
                src={img4}
                alt="Tratamientos personalizados"
                />
            </Carousel.Item>

            <Carousel.Item>
                <img
                className="d-block w-100 hero-img"
                src={img5}
                alt="Tratamientos personalizados"
                />
            </Carousel.Item>
        </Carousel>
    )
}

export default HeroCarousel