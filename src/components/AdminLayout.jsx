import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/Auth";

import DrReumaLogo from "../assets/DrReumaLogo.svg";

function AdminLayout({ children }) {

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {

    await signOut(auth);

    navigate("/");

  };

  const isActive = (path) =>
    location.pathname === path ? "active" : "";

  return (

    <div className="admin-layout">

      {/* SIDEBAR */}
      <div className="admin-sidebar">

        <div className="text-center mb-4">

          <img
            src={DrReumaLogo}
            alt="logo"
            style={{ width: "60px" }}
          />

          <h6 className="mt-2">
            Panel Admin
          </h6>

        </div>


        <Link
          to="/admin"
          className={`admin-link ${isActive("/admin")}`}
        >
          Dashboard
        </Link>


        <Link
          to="/"
          className="admin-link"
        >
          Ver sitio web
        </Link>


        <button
          onClick={handleLogout}
          className="admin-link logout-btn"
        >
          Cerrar sesión
        </button>

      </div>


      {/* CONTENT */}
      <div className="admin-content">

        {children}

      </div>

    </div>

  );

}

export default AdminLayout;