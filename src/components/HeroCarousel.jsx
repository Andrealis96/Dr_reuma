import Carousel from 'react-bootstrap/Carousel'

// DESKTOP
import img1 from '../assets/banner1.webp'
import img2 from '../assets/banner2.webp'
import img3 from '../assets/banner3.webp'
import img4 from '../assets/banner4.webp'
import img5 from '../assets/banner5.webp'

// MOBILE 🔥
import imgMobile1 from '../assets/bannertelef1.webp'
import imgMobile2 from '../assets/bannertelef2.webp'
import imgMobile3 from '../assets/bannertelef3.webp'
import imgMobile4 from '../assets/bannertelef4.webp'
import imgMobile5 from '../assets/bannertelef5.webp'

function HeroCarousel() {
    return (
        <Carousel fade interval={4500} controls indicators className="hero-carousel">
        
            <Carousel.Item>
                <picture>
                    <source media="(max-width: 768px)" srcSet={imgMobile1} />
                    <img className="d-block w-100 hero-img" src={img1} alt="Atención en reumatología" loading="eager"  style={{ minHeight: "200px" }}/>
                </picture>
            </Carousel.Item>

            <Carousel.Item>
                <picture>
                    <source media="(max-width: 768px)" srcSet={imgMobile2} />
                    <img className="d-block w-100 hero-img" src={img2} alt="Diagnóstico preciso"  style={{ minHeight: "200px" }}/>
                </picture>
            </Carousel.Item>

            <Carousel.Item>
                <picture>
                    <source media="(max-width: 768px)" srcSet={imgMobile3} />
                    <img className="d-block w-100 hero-img" src={img3} alt="Tratamientos personalizados"  style={{ minHeight: "200px" }}/>
                </picture>
            </Carousel.Item>

            <Carousel.Item>
                <picture>
                    <source media="(max-width: 768px)" srcSet={imgMobile4} />
                    <img className="d-block w-100 hero-img" src={img4} alt="Tratamientos personalizados"  style={{ minHeight: "200px" }}/>
                </picture>
            </Carousel.Item>

            <Carousel.Item>
                <picture>
                    <source media="(max-width: 768px)" srcSet={imgMobile5} />
                    <img className="d-block w-100 hero-img" src={img5} alt="Tratamientos personalizados"  style={{ minHeight: "200px" }}/>
                </picture>
            </Carousel.Item>

        </Carousel>
    )
}

export default HeroCarousel