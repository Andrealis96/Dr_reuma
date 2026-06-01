import Welcome from '../components/Welcome'
import Solutions from '../components/Solutions'
import Services from '../components/Services'
import HeroCarousel from '../components/HeroCarousel'
import Testimonials from '../components/Testimonials'
import Galeria from '../components/Galeria'
import Faq from "../components/Faq"; 
function Home() {
    return (
        <>
        <HeroCarousel/>
        <Welcome />
        <Solutions />
        <Services />
        <Galeria />
        <Faq />
        <Testimonials />
        </>
    )
}

export default Home;
