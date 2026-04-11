import React from "react";
import { Link } from "react-router-dom";

import {
FaUserInjured,
FaComments,
FaFlask,
FaCalendarAlt
} from "react-icons/fa";

function AdminPanel(){

return(

<div className="container-fluid text-center mt-5">
  <h2 className="subtitle-general ">
    <span className="subtitle-celeste">PANEL </span>
    <span className="subtitle-negro">ADMINISTRATIVO</span>
  </h2>

  <div className="row g-4 p-5 justify-content-center">
    <div className="col-md-5">
    <Link to="/admin/historias" className="text-decoration-none">
      <div className="card panel-card text-center p-4 h-100">
        <div className="icono-panel">
        <FaUserInjured size={45}/>
        </div>
        <h5 className="fw-bold mt-4">Historias Clínicas</h5>
      </div>
    </Link>
    </div>

    <div className="col-md-5">
    <Link to="/admin/comentarios" className="text-decoration-none">
    <div className="card panel-card text-center p-4 h-100">
    <div className="icono-panel">
    <FaComments size={45}/>
    </div>
    <h5 className="fw-bold mt-3">Comentarios</h5>
    </div>
    </Link>
    </div>

    <div className="col-md-5">
    <Link to="/admin/laboratorios" className="text-decoration-none">
    <div className="card panel-card text-center p-4 h-100">
    <div className="icono-panel">
    <FaFlask size={45}/>
    </div>
    <h5 className="fw-bold mt-3">Laboratorios</h5>
    </div>
    </Link>
    </div>

    <div className="col-md-5">
    <Link to="/admin/citas" className="text-decoration-none">
    <div className="card panel-card text-center p-4 h-100">
    <div className="icono-panel">
    <FaCalendarAlt size={45}/>
    </div>
    <h5 className="fw-bold mt-3">Agendar citas</h5>

    </div>
    </Link>
    </div>

  </div>

</div>

);

}

export default AdminPanel;