import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { signOut } from "firebase/auth";
import { auth } from "../firebase/Auth";

import DrReumaLogo from "../assets/DrReumaLogo.png";

import {
  FaHome,
  FaCalendarAlt,
  FaNotesMedical,
  FaFlask,
  FaGlobe,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";


function AdminLayout({ children }) {

  const navigate = useNavigate();
  const location = useLocation();

  const [menuAbierto, setMenuAbierto] = useState(false);


  /* =========================
     CERRAR SESIÓN
  ========================= */

  const handleLogout = async () => {

    await signOut(auth);

    navigate("/");

  };


  /* =========================
     LINK ACTIVO
  ========================= */

  const isActive = (path) => {

    if (path === "/admin") {
      return location.pathname === "/admin"
        ? "active"
        : "";
    }

    return location.pathname.startsWith(path)
      ? "active"
      : "";

  };


  const cerrarMenu = () => {
    setMenuAbierto(false);
  };


  return (

    <div className="admin-layout-nuevo">


      {/* =========================
          BOTÓN MÓVIL
      ========================= */}

      <button
        type="button"
        className="admin-sidebar-mobile-btn"
        onClick={() => setMenuAbierto(true)}
        aria-label="Abrir menú administrativo"
      >
        <FaBars />
      </button>


      {/* =========================
          FONDO MÓVIL
      ========================= */}

      {menuAbierto && (

        <div
          className="admin-sidebar-overlay"
          onClick={cerrarMenu}
        />

      )}


      {/* =========================
          SIDEBAR DERECHA
      ========================= */}

      <aside
        className={`admin-sidebar-derecha ${
          menuAbierto ? "abierta" : ""
        }`}
      >


        {/* CERRAR EN CELULAR */}

        <button
          type="button"
          className="admin-sidebar-cerrar"
          onClick={cerrarMenu}
          aria-label="Cerrar menú"
        >
          <FaTimes />
        </button>


        {/* LOGO */}

        <div className="admin-sidebar-header">

          <img
            src={DrReumaLogo}
            alt="Dr. Reuma"
            className="admin-sidebar-logo"
          />

          <div>
            <strong>DR. REUMA</strong>

            <span>
              Sistema Administrativo
            </span>
          </div>

        </div>


        {/* NAVEGACIÓN */}

        <nav className="admin-sidebar-nav">


          <Link
            to="/admin"
            onClick={cerrarMenu}
            className={`admin-sidebar-link ${isActive("/admin")}`}
          >

            <FaHome />

            <span>
              Inicio
            </span>

          </Link>


          <Link
            to="/admin/citas"
            onClick={cerrarMenu}
            className={`admin-sidebar-link ${isActive("/admin/citas")}`}
          >

            <FaCalendarAlt />

            <span>
              Agenda
            </span>

          </Link>


          <Link
            to="/admin/historias"
            onClick={cerrarMenu}
            className={`admin-sidebar-link ${isActive("/admin/historias")}`}
          >

            <FaNotesMedical />

            <span>
              Historias clínicas
            </span>

          </Link>


          <Link
            to="/admin/laboratorios"
            onClick={cerrarMenu}
            className={`admin-sidebar-link ${isActive("/admin/laboratorios")}`}
          >

            <FaFlask />

            <span>
              Laboratorios
            </span>

          </Link>


        </nav>


        {/* PARTE INFERIOR */}

        <div className="admin-sidebar-footer">


          <Link
            to="/"
            className="admin-sidebar-link admin-sidebar-web"
            onClick={cerrarMenu}
          >

            <FaGlobe />

            <span>
              Ver sitio web
            </span>

          </Link>


          <button
            type="button"
            onClick={handleLogout}
            className="admin-sidebar-link admin-sidebar-logout"
          >

            <FaSignOutAlt />

            <span>
              Cerrar sesión
            </span>

          </button>


        </div>


      </aside>


      {/* =========================
          CONTENIDO DEL PANEL
      ========================= */}

      <main className="admin-contenido-principal">

        {children}

      </main>


    </div>

  );

}


export default AdminLayout;