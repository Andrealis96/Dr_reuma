import React, { useEffect, useState } from "react";
import {
collection,
addDoc,
onSnapshot,
deleteDoc,
doc,
updateDoc
} from "firebase/firestore";
import { query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

import {
FaSearch,
FaTrash,
FaPencilAlt,
FaFileMedical,
FaCheckCircle,
FaChevronLeft,
FaChevronRight
} from "react-icons/fa";
import maleAvatar from "../assets/user-male.png";
import femaleAvatar from "../assets/user-female.png";
import "../styles/App.css";

function HistoriasClinicas(){

const [pacientes,setPacientes] = useState([]);

const [nombre,setNombre] = useState("");
const [dni,setDni] = useState("");
const [fechaNacimiento,setFechaNacimiento] = useState("");
const [obraSocial,setObraSocial] = useState("");
const [sexo,setSexo] = useState("");

const [busqueda,setBusqueda] = useState("");

const [pagina,setPagina] = useState(1);
const pacientesPorPagina = 5;

const [editando,setEditando] = useState(null);

const [mensaje,setMensaje] = useState("");

const formatearFecha = (fecha) => {
  const f = new Date(fecha);
  return f.toLocaleDateString("es-AR");
};

useEffect(() => {

  const q = query(
    collection(db, "historiasClinicas"),
    orderBy("creado", "desc")
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const datos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setPacientes(datos);
  });

  return () => unsubscribe();

}, []);

const crearPaciente = async(e)=>{

e.preventDefault();

await addDoc(collection(db,"historiasClinicas"),{
nombre,
dni,
fechaNacimiento,
obraSocial,
sexo,
creado:new Date()
});

setNombre("");
setDni("");
setFechaNacimiento("");
setObraSocial("");
setSexo("");
setMensaje("Paciente creado correctamente");

setTimeout(()=>setMensaje(""),3000);

};

const eliminarPaciente = async(id)=>{

if(window.confirm("¿Eliminar paciente?")){
await deleteDoc(doc(db,"historiasClinicas",id));
}

};

const editarPaciente = (p)=>{

setEditando(p.id);

setNombre(p.nombre);
setDni(p.dni);
setFechaNacimiento(p.fechaNacimiento);
setObraSocial(p.obraSocial);
setSexo(p.sexo);

window.scrollTo({top:0,behavior:"smooth"});

};

const guardarEdicion = async(e)=>{

e.preventDefault();

await updateDoc(doc(db,"historiasClinicas",editando),{
nombre,
dni,
fechaNacimiento,
obraSocial,
sexo,
});

setEditando(null);

setNombre("");
setDni("");
setFechaNacimiento("");
setObraSocial("");
setSexo("");
setMensaje("Paciente actualizado");

setTimeout(()=>setMensaje(""),3000);

};

const cancelarEdicion = ()=>{

setEditando(null);
setNombre("");
setDni("");
setFechaNacimiento("");
setObraSocial("");
setSexo("");

};

const pacientesFiltrados = pacientes.filter(p=>{

const texto = busqueda.toLowerCase();

return(
p.nombre.toLowerCase().includes(texto) ||
p.dni?.includes(texto)
);

});

const indiceFinal = pagina * pacientesPorPagina;
const indiceInicial = indiceFinal - pacientesPorPagina;

const pacientesPagina = pacientesFiltrados.slice(indiceInicial,indiceFinal);

const totalPaginas = Math.ceil(pacientesFiltrados.length / pacientesPorPagina);

return(

<div className="container mt-4 mb-5 pb-5">

<h2 className="mb-4 subtitle-general text-center">
  {editando ? ( 
    <>
      <span className=" fw-bold subtitle-celeste">EDITAR</span>{" "}
      <span className="fw-bold subtitle-negro">PACIENTE</span>
    </>
  ) : (
    <>
      <span className=" fw-bold subtitle-celeste">HISTORIAS</span>{" "}
      <span className="fw-bold subtitle-negro">CLÍNICAS</span>
    </>
  )}
</h2>

{mensaje &&(

<div className="alert alert-success d-flex align-items-center">

<FaCheckCircle className="me-2"/>

{mensaje}

</div>

)}
<div className="row justify-content-center">
    <div className="col-md-6 text-center mb-4">
        <form
        onSubmit={editando ? guardarEdicion : crearPaciente}
        className="card p-3 md-3 form-card"
        >

        <input
        className="form-control mb-2"
        placeholder="Nombre paciente"
        value={nombre}
        onChange={(e)=>setNombre(e.target.value)}
        required
        />

        <input
        className="form-control mb-2"
        placeholder="DNI"
        value={dni}
        onChange={(e)=>setDni(e.target.value)}
        required
        />

        <input
        type="date"
        className="form-control mb-2"
        value={fechaNacimiento}
        onChange={(e)=>setFechaNacimiento(e.target.value)}
        required
        />

        <input
        className="form-control mb-2"
        placeholder="Obra social"
        value={obraSocial}
        onChange={(e)=>setObraSocial(e.target.value)}
        required
        />

        <select
        className="form-control mb-2"
        value={sexo}
        onChange={(e)=>setSexo(e.target.value)}
        required
        >
        <option value="">Seleccione sexo</option>
        <option value="Masculino">Masculino</option>
        <option value="Femenino">Femenino</option>
        </select>

        <div>

        <button className="btn btn-orange fw-bold">
        {editando ? "GUARDAR CAMBIOS" : "GUARDAR"}
        </button>

        {editando &&(
        <button
        type="button"
        className="btn btn-orange fw-bold ms-2"
        onClick={cancelarEdicion}
        >
        CANCELAR
        </button>
        )}

        </div>

    </form>
    </div>

</div>

<div className="input-group mb-4">
    <span className="input-group-text">
    <FaSearch/>
    </span>

    <input
    className="form-control"
    placeholder="Buscar por nombre o DNI..."
    value={busqueda}
    onChange={(e)=>setBusqueda(e.target.value)}
    />
</div>

{pacientesPagina.map(p=>{

const sexoTexto = p.sexo?.toLowerCase() || "";

const avatar = sexoTexto === "femenino"
  ? femaleAvatar
  : maleAvatar;
return(

<div key={p.id} className="card mb-3 p-3 paciente-card">

<div className="d-flex align-items-center justify-content-between">

<div className="d-flex align-items-center">

<img
src={avatar}
width="55"
height="55"
className="rounded-circle me-3"
/>
 

<div>

<strong className="clinica-green fw-bold">{p.nombre}</strong> 

<div> <span className="fw-semibold">DNI:</span> {p.dni}</div>
<div> <span className="fw-semibold">Nacimiento:</span> {formatearFecha(p.fechaNacimiento)}</div>
<div> <span className="fw-semibold">Obra social:</span> {p.obraSocial}</div>
<div> <span className="fw-semibold">Sexo:</span> {p.sexo}</div>

</div>

</div>

<div className="d-flex gap-2">

<Link
to={`/admin/historia/${p.id}`}
className="btn btn-outline-success btn-sm"
>
<FaFileMedical/>
</Link>

<button
onClick={()=>editarPaciente(p)}
className="btn btn-outline-warning btn-sm"
>
<FaPencilAlt/>
</button>

<button
onClick={()=>eliminarPaciente(p.id)}
className="btn btn-outline-danger btn-sm"
>
<FaTrash/>
</button>

</div>

</div>

</div>

);

})}

<div className="d-flex justify-content-center mt-5 mb-5">

<button
className="btn btn-outline-secondary me-3"
disabled={pagina===1}
onClick={()=>setPagina(pagina-1)}
>
<FaChevronLeft/>
</button>

<span className="align-self-center fw-bold">
{pagina} / {totalPaginas || 1}
</span>

<button
className="btn btn-outline-secondary ms-3"
disabled={pagina===totalPaginas}
onClick={()=>setPagina(pagina+1)}
>
<FaChevronRight/>
</button>

</div>

</div>

);

}

export default HistoriasClinicas;