import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  FaSearch,
  FaTrash,
  FaEdit,
  FaStar,
  FaEnvelopeOpenText,
  FaComments
} from "react-icons/fa";

import { useSearchParams } from "react-router-dom";

import DoctorLogo from "../assets/AssitenteDoctor.svg";

function ComentariosPanel() {

  const [reviews,setReviews] = useState([]);
  const [searchParams,setSearchParams] = useSearchParams();
  const [filtro,setFiltro] = useState("todos");
  const [busqueda,setBusqueda] = useState("");
  const [editando,setEditando] = useState(null);
  const [respuestaEditada,setRespuestaEditada] = useState("");

  const [paginaActual,setPaginaActual] = useState(1);
  const reviewsPorPagina = 5;

  useEffect(()=>{
    const filtroURL = searchParams.get("filtro") || "todos";
    setFiltro(filtroURL);
    setPaginaActual(1);
  },[searchParams]);

  useEffect(() => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}, [paginaActual]);

  useEffect(()=>{
    const q = collection(db,"reviews");

    const unsubscribe = onSnapshot(q,(snapshot)=>{
      const datos = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));
      setReviews(datos);
    });

    return ()=>unsubscribe();
  },[]);

  const esNoLeidos = filtro === "noLeidos";

  const activos = reviews.filter(r=>!r.eliminado);

  const total = activos.length;

  const noLeidos = activos.filter(
    r=>!r.adminReply || r.adminReply.trim()===""
  ).length;

  const promedio = activos.length > 0
  ? (
    activos.reduce((acc,r)=>acc + (r.rating || 0),0)
    / activos.length
  ).toFixed(1)
  : 0;

  let reviewsFiltradas = reviews.filter(r=>{

    if(r.eliminado) return false;

    if(filtro==="noLeidos")
      return !r.adminReply || r.adminReply.trim()==="";

    if(filtro==="respondidos")
      return r.adminReply && r.adminReply.trim()!=="";

    return true;

  });

  if(filtro==="recientes"){
    reviewsFiltradas.sort(
      (a,b)=> b.createdAt?.seconds - a.createdAt?.seconds
    );
  }

  if(filtro==="antiguos"){
    reviewsFiltradas.sort(
      (a,b)=> a.createdAt?.seconds - b.createdAt?.seconds
    );
  }

  if(!esNoLeidos){
    reviewsFiltradas = reviewsFiltradas.filter(r=>
      r.name?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.comment?.toLowerCase().includes(busqueda.toLowerCase())
    );
  }

  const indexUltimo = paginaActual * reviewsPorPagina;
  const indexPrimero = indexUltimo - reviewsPorPagina;
  const reviewsActuales = reviewsFiltradas.slice(indexPrimero,indexUltimo);

  const totalPaginas = Math.ceil(reviewsFiltradas.length / reviewsPorPagina);

  const eliminarReview = async(id)=>{
    if(window.confirm("¿Eliminar comentario?")){
      await updateDoc(doc(db,"reviews",id),{
        eliminado:true
      });
    }
  };

  const guardarEdicion = async(id)=>{
    await updateDoc(doc(db,"reviews",id),{
      adminReply:respuestaEditada,
      repliedAt:new Date()
    });

    setEditando(null);
    setRespuestaEditada("");
  };

  const cambiarFiltro = (nuevo)=>{
    setSearchParams({filtro:nuevo});
  };

  return(

    <div className="container comentarios-container mt-4">

      <h2 className="mb-4 text-center subtitle-general">
        {esNoLeidos ? 
        (<>
        <span className="subtitle-celeste fw-bold">MENSAJES NO </span>
        <span className="subtitle-negro fw-bold">LEÍDOS</span>
        </>)
        : 
        (<>
        <span className="subtitle-celeste fw-bold">PANEL DE </span>
        <span className="subtitle-negro fw-bold">COMENTARIOS</span>
        </>)}
      </h2>

      {!esNoLeidos &&(

        <>
        <div className="row mb-4 text-center g-3 ">

          <div className="col-md-4">
            <div className="card shadow-sm p-3 justify-content-center align-items-center d-flex flex-column">
              <FaComments size={40}/>
              <h6>TOTAL</h6>
              <h3>{total}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm p-3 justify-content-center align-items-center d-flex flex-column">
              <FaEnvelopeOpenText size={40}/>
              <h6>NO LEÍDOS</h6>
              <h3>{noLeidos}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow-sm p-3 justify-content-center align-items-center d-flex flex-column">
              <FaStar size={40}/>
              <h6>PROMEDIO</h6>
              <h3>{promedio}</h3>
            </div>
          </div>

        </div>

        <div className="input-group mb-4">
          <span className="input-group-text">
            <FaSearch/>
          </span>

          <input
            className="form-control"
            placeholder="Buscar..."
            value={busqueda}
            onChange={(e)=>setBusqueda(e.target.value)}
          />
        </div>

        <div className="mb-4 d-flex gap-2 flex-wrap justify-content-center">
          <button className="btn btn-outline-success btn-sm" onClick={()=>cambiarFiltro("todos")}>TODOS</button>
          <button className="btn btn-outline-primary btn-sm" onClick={()=>cambiarFiltro("noLeidos")}>NO LEÍDOS</button>
          <button className="btn btn-outline-success btn-sm" onClick={()=>cambiarFiltro("respondidos")}>RESPONDIDOS</button>
          <button className="btn btn-outline-primary btn-sm" onClick={()=>cambiarFiltro("recientes")}>RECIENTES</button>
          <button className="btn btn-outline-success btn-sm" onClick={()=>cambiarFiltro("antiguos")}>ANTIGUOS</button>
        </div>

        </>
      )}
    {reviewsFiltradas.length === 0 && (
    <div className="text-center mt-5 empty-state justify-content-center align-items-center d-flex flex-column">
    
    <FaEnvelopeOpenText size={60} className="mb-3 text-muted "/>

    <h5 className="fw-bold text-muted">
      {filtro === "noLeidos"
        ? "No hay mensajes no leídos 🎉"
        : "No hay comentarios disponibles"}
    </h5>

    <p className="text-muted">
      Todo está al día. Buen trabajo 😎
    </p>

  </div>
)}
      {reviewsActuales.map((review)=>(

        <div key={review.id} className="card comentario-card mb-3 shadow-sm">

          <div className="card-body ">

            {/* HEADER */}
            <div className="d-flex justify-content-between align-items-center">

                <div className="d-flex align-items-center">
  <img
    src={`https://ui-avatars.com/api/?name=${review.name}`}
    width="40"
    className="rounded-circle me-2"
  />
  <div>
    <strong>{review.name}</strong>
    {review.createdAt && (
      <div className="text-muted" style={{ fontSize: "12px" }}>
        {new Date(review.createdAt.seconds * 1000).toLocaleString("es-ES")}
      </div>
    )}
  </div>
</div>
              {review.adminReply
                ? <span className="badge bg-dark">RESPONDIDO</span>
                : <span className="badge bg-danger">NO LEÍDO</span>
              }

            </div>

            <p className="mt-2">{review.comment}</p>

            {/* RESPUESTA */}
            {review.adminReply &&(
              <div className="respuesta-box">
                <div className="d-flex align-items-center mb-1">
                  <img src={DoctorLogo} width="30" className="me-2"/>
                  <strong>DR. REUMA</strong>
                </div>
                <p>{review.adminReply}</p>
              </div>
            )}

            {/* EDITAR */}
            {editando === review.id &&(
              <div className="mt-2">
                <textarea
                  className="form-control mb-2"
                  value={respuestaEditada}
                  onChange={(e)=>setRespuestaEditada(e.target.value)}
                />
                <button
                  className="btn btn-success btn-sm fw-bold"
                  onClick={()=>guardarEdicion(review.id)}
                >
                  GUARDAR
                </button>
              </div>
            )}

            <div className="mt-3 d-flex gap-2">
              <button className="btn btn-outline-warning btn-sm"
                onClick={()=>{
                  setEditando(review.id);
                  setRespuestaEditada(review.adminReply || "");
                }}>
                <FaEdit/>
              </button>

              <button className="btn btn-outline-danger btn-sm"
                onClick={()=>eliminarReview(review.id)}>
                <FaTrash/>
              </button>
            </div>

          </div>

        </div>

      ))}

      {/* PAGINACIÓN */}
      <div className="d-flex justify-content-center mt-4 gap-2 flex-wrap">

        {Array.from({length: totalPaginas},(_,i)=>(
          <button
            key={i}
            className={`btn btn-sm ${paginaActual === i+1 ? "btn-dark" : "btn-outline-dark"}`}
            onClick={()=>setPaginaActual(i+1)}
          >
            {i+1}
          </button>
        ))}

      </div>

    </div>

  );
}

export default ComentariosPanel;