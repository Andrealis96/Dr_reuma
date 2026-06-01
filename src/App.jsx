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
import Faq from "./pages/Faq";

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
      <Route path="/diagnosticos" element={<Solutions />} />
      <Route path="/servicios" element={<Services />} />
      <Route path="/galeria" element={<Galeria />} />
      <Route path="/testimonios" element={<Testimonials />} />
      <Route path="/nosotros" element={<About />} />
      <Route path="/preguntas-frecuentes" element={<Faq />} />
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