import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/Auth";

/* =========================
   COMPONENTES GENERALES
========================= */

import NavbarDrReuma from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingAssistant from "./components/FloatingAssistant";
import ChatInternoBurbuja from "./components/ChatInternoBurbuja";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";

/* =========================
   PÁGINAS PÚBLICAS
========================= */

import Home from "./pages/Home";
import About from "./pages/About";

import DiagnosticoPage from "./pages/DiagnosticoPage";
import ServiciosPage from "./pages/ServiciosPage";
import GaleriaPage from "./pages/GaleriaPage";
import FaqPage from "./pages/FaqPage";

import LoginAdmin from "./pages/LoginAdmin";

/* =========================
   DIAGNÓSTICOS
========================= */

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

/* =========================
   PANEL ADMIN
========================= */

import AdminPanel from "./pages/AdminPanel";
import HistoriasClinicas from "./pages/HistoriasClinicas";
import HistoriaPaciente from "./pages/HistoriaPaciente";
import Citas from "./pages/Citas";
import Laboratorios from "./pages/Laboratorios";

/* =========================
   ESTILOS
========================= */

import "./styles/App.css";


function App() {

  // ==========================================
  // SESIÓN FIREBASE
  // ==========================================

  const [usuarioActivo, setUsuarioActivo] = useState(null);
  const [authLista, setAuthLista] = useState(false);


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(
      auth,
      (usuario) => {

        setUsuarioActivo(usuario);

        setAuthLista(true);

      }
    );


    return () => unsubscribe();

  }, []);


  return (

    <div className="app-background">

      <div className="joints-background" />


      <div className="app-content">

        <ScrollToTop />

        <NavbarDrReuma />


        <div className="routes-container">

          <Routes>

            {/* ======================================
                PÁGINA PRINCIPAL
            ====================================== */}

            <Route
              path="/"
              element={<Home />}
            />


            {/* ======================================
                DIAGNÓSTICOS
            ====================================== */}

            <Route
              path="/diagnosticos"
              element={<DiagnosticoPage />}
            />

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


            {/* ======================================
                OTRAS PÁGINAS PÚBLICAS
            ====================================== */}

            <Route
              path="/servicios"
              element={<ServiciosPage />}
            />

            <Route
              path="/galeria"
              element={<GaleriaPage />}
            />

            <Route
              path="/nosotros"
              element={<About />}
            />

            <Route
              path="/preguntas-frecuentes"
              element={<FaqPage />}
            />


            {/* ======================================
                LOGIN
            ====================================== */}

            <Route
              path="/loginAdmin"
              element={<LoginAdmin />}
            />


            {/* ======================================
                PANEL ADMIN
            ====================================== */}

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />


            {/* HISTORIAS CLÍNICAS */}

            <Route
              path="/admin/historias"
              element={
                <ProtectedRoute>
                  <HistoriasClinicas />
                </ProtectedRoute>
              }
            />


            {/* HISTORIA DE PACIENTE */}

            <Route
              path="/admin/historia/:id"
              element={
                <ProtectedRoute>
                  <HistoriaPaciente />
                </ProtectedRoute>
              }
            />


            {/* CITAS */}

            <Route
              path="/admin/citas"
              element={
                <ProtectedRoute>
                  <Citas />
                </ProtectedRoute>
              }
            />


            {/* LABORATORIOS */}

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


        {/* ==========================================
            BURBUJA FLOTANTE
        ========================================== */}

        {authLista && (

          usuarioActivo ? (

            <ChatInternoBurbuja />

          ) : (

            <FloatingAssistant />

          )

        )}


        <Footer />


        <ToastContainer
          position="top-right"
          autoClose={3000}
        />

      </div>

    </div>

  );

}

export default App;