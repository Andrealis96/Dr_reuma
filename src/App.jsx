import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavbarDrReuma from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingAssistant from "./components/FloatingAssistant";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Galeria from "./components/Galeria";
import Testimonials from "./components/Testimonials";
import Solutions from "./components/Solutions";
import Services from "./components/Services";
import LoginAdmin from "./pages/LoginAdmin";
import AdminPanel from "./pages/AdminPanel";
import HistoriasClinicas from "./pages/HistoriasClinicas";
import HistoriaPaciente from "./pages/HistoriaPaciente";
import ComentariosPanel from "./pages/ComentariosPanel";
import Citas from "./pages/Citas";
import Laboratorios from "./pages/Laboratorios";
import Faq from "./components/Faq";
import DiagnosticoPage from "./pages/DiagnosticoPage";
import ServiciosPage from "./pages/ServiciosPage";
import ArtritisReumatoide from "./pages/ArtritisReumatoide";
import Artrosis from "./pages/Artrosis";
import Fibromialgia from "./pages/Fibromialgia";
import Lupus from "./pages/Lupus";
import Esclerodermia from "./pages/Esclerodermia";
import Gota from "./pages/Gota";
import Dolorcolumna from "./pages/Dolorcolumna";
import Osteoporosis from "./pages/Osteoporosis";
import Artritispsoriasica from "./pages/Artritispsoriasica";
import Dolorrodillas from "./pages/Dolorrodillas";
import Hormigueo from "./pages/Hormigueo";
import Dermatomiositis from "./pages/Dermatomiositis";
import Nosesolomeduele from "./pages/Nosesolomeduele";
import GaleriaPage from "./pages/GaleriaPage";
import TestimoniosPage from "./pages/TestimoniosPage";
import FaqPage from "./pages/FaqPage";
import "./styles/App.css";

function App() {

  return (

    <div className="app-background">

      <div className="joints-background"></div>

 <div className="app-content">

  <ScrollToTop />

  <NavbarDrReuma />

  <div className="routes-container">
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/diagnosticos" element={<DiagnosticoPage />} />
        <Route
            path="/diagnosticos/artritis-reumatoide"
            element={<ArtritisReumatoide />}
          />
        <Route
            path="/diagnosticos/artrosis"
            element={<Artrosis />}
          />
        <Route
            path="/diagnosticos/fibromialgia"
            element={<Fibromialgia />}
          />
        <Route
            path="/diagnosticos/lupus"
            element={<Lupus />}
          />
        <Route
            path="/diagnosticos/esclerodermia"
            element={<Esclerodermia />}
          />
          <Route
            path="/diagnosticos/gota"
            element={<Gota />}
          />
        <Route
            path="/diagnosticos/dolor-columna-cadera"
            element={<Dolorcolumna />}
          />
        <Route
            path="/diagnosticos/osteoporosis"
            element={<Osteoporosis />}
          />
        <Route
            path="/diagnosticos/artritis-psoriasica"
            element={<Artritispsoriasica />}
          />
        <Route
            path="/diagnosticos/dolor-rodillas"
            element={<Dolorrodillas />}
          />
        <Route
            path="/diagnosticos/hormigueo-adormecimiento"
            element={<Hormigueo />}
          />
        <Route
            path="/diagnosticos/dermatomiositis"
            element={<Dermatomiositis />}
          />
        <Route
            path="/diagnosticos/no-se-solo-me-duele"
            element={<Nosesolomeduele />}
          />
      <Route path="/servicios" element={<ServiciosPage />} />
      <Route path="/galeria" element={<GaleriaPage />} />
      <Route path="/testimonios" element={<TestimoniosPage />} />
      <Route path="/nosotros" element={<About />} />
      <Route path="/preguntas-frecuentes" element={<FaqPage />} />
      <Route path="/loginAdmin" element={<LoginAdmin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/historias"
        element={
          <ProtectedRoute>
            <HistoriasClinicas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/historia/:id"
        element={
          <ProtectedRoute>
            <HistoriaPaciente />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/comentarios"
        element={
          <ProtectedRoute>
            <ComentariosPanel />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/citas"
        element={
          <ProtectedRoute>
            <Citas />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/laboratorios"
        element={
          <ProtectedRoute>
            <Laboratorios />
          </ProtectedRoute>
        }
      />
    </Routes>
  </div>

  <FloatingAssistant />

  <Footer />
  <ToastContainer position="top-right" autoClose={3000} />
</div>

    </div>

  );

}

export default App;