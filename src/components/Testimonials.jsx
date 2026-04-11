import { useEffect, useState } from "react";
import { FaStar, FaCheckCircle } from "react-icons/fa";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { db } from "../firebase";
import { auth } from "../firebase/Auth";

import AssitenteDoctor from "../assets/AssitenteDoctor.svg";

export default function Testimonials() {

  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  const [reviews, setReviews] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);

  const [activeReply, setActiveReply] = useState(null);
  const [replyText, setReplyText] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  const reviewsRef = collection(db, "reviews");


  // detectar admin
  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (user) => {

      if (user && user.email === "tonygregoryvelez@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }

    });

    return () => unsub();

  }, []);


  // cargar reviews
  const fetchReviews = async () => {

    const q = query(reviewsRef, orderBy("createdAt", "desc"));

    const snap = await getDocs(q);

    setReviews(
      snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    );

  };

  useEffect(() => {
    fetchReviews();
  }, []);


  // enviar comentario
  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!comment) return;

    await addDoc(reviewsRef, {
      name: name || "Paciente",
      comment,
      rating,
      createdAt: serverTimestamp()
    });

    setName("");
    setComment("");
    setRating(5);

    fetchReviews();

  };


  // responder
  const handleReply = async (id) => {

    if (!replyText) return;

    const ref = doc(db, "reviews", id);

    await updateDoc(ref, {
      adminReply: replyText,
      repliedAt: serverTimestamp()
    });

    setReplyText("");
    setActiveReply(null);

    fetchReviews();

  };


  // promedio
  const avg =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
      : 0;

  const avgDisplay = avg.toFixed(1);


  // paginacion
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;

  const currentReviews = reviews.slice(
    indexOfFirstReview,
    indexOfLastReview
  );


  const goToPage = (page) => {

    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);

    window.scrollTo({
      top: document.querySelector(".testimonials-section")?.offsetTop || 0,
      behavior: "smooth"
    });

  };


  // avatar neutro profesional
  const getAvatar = () => {
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  };


  // formatear fecha
  const formatDate = (timestamp) => {

    if (!timestamp?.toDate) return "";

    return timestamp
      .toDate()
      .toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  };


  return (

    <section id="testimonios" className="testimonials-section container py-5">
      <h2 className="text-center subtitle-general mb-3">
        <span className="subtitle-celeste">OPINIONES DE NUESTROS</span>
        <span className="subtitle-negro"> PACIENTES</span>
      </h2>


      {/* promedio */}
      <div className="text-center mb-4">

        {[1,2,3,4,5].map(s => (
          <FaStar
            key={s}
            color={s <= Math.round(avg) ? "#ffc107" : "#e4e5e9"}
            size={22}
          />
        ))}

        <div className="mt-1 text-muted">
          {avgDisplay} / 5 Puntaje   -  {reviews.length}  (Opiniones)
        </div>

      </div>


      {/* formulario */}
      <div className="d-flex justify-content-center">

        <form
          onSubmit={handleSubmit}
          className="card shadow-sm p-4 mb-5"
          style={{ maxWidth:"500px", width:"100%" }}
        >

          <input
            className="form-control mb-2"
            placeholder="Tu nombre (opcional)"
            value={name}
            onChange={(e)=>setName(e.target.value)}
          />

          <textarea
            className="form-control mb-3"
            placeholder="Contanos tu experiencia"
            value={comment}
            onChange={(e)=>setComment(e.target.value)}
            required
          />

          <div className="mb-3">
            <span> Calificar 1 a 5:  </span>
            {[1,2,3,4,5].map(s => (

              <FaStar
                key={s}
                size={26}
                style={{cursor:"pointer"}}
                color={s <= rating ? "#ffc107" : "#ff0000"}
                onClick={()=>setRating(s)}
              />

            ))}

          </div>

          <button className="btn btn-dark  fw-bold w-100">
            Enviar comentario
          </button>

        </form>

      </div>


      {/* lista */}
      {currentReviews.map(review => (

        <div
          key={review.id}
          className="card shadow-sm mb-3"
          style={{
            borderRadius:"12px",
            animation:"fadeIn 0.4s ease"
          }}
        >

          <div className="card-body">

            {/* header */}
            <div className="d-flex">

              <img
                src={getAvatar()}
                alt="avatar"
                style={{
                  width:"45px",
                  height:"45px",
                  borderRadius:"50%",
                  marginRight:"12px"
                }}
              />

              <div className="flex-grow-1">

                <div className="d-flex justify-content-between align-items-center">

                  <strong>{review.name}</strong>

                  <small className="text-muted">
                    {formatDate(review.createdAt)}
                  </small>

                </div>

                <div>

                  {[1,2,3,4,5].map(s => (
                    <FaStar
                      key={s}
                      size={15}
                      color={s <= review.rating ? "#ffc107" : "#e4e5e9"}
                    />
                  ))}

                </div>

              </div>

            </div>


            {/* comentario */}
            <p className="mt-2 mb-1">
              {review.comment}
            </p>


            {/* respuesta */}
            {review.adminReply && (

              <div
                className="mt-3 p-3"
                style={{
                  background:" rgba(182, 255, 141, 0.32)",
                  borderRadius:"10px",
                  borderLeft:"4px solid #070404"
                }}
              >

                <div className="d-flex">

                  <img
                    src={AssitenteDoctor}
                    alt="doctor"
                    style={{
                      width:"38px",
                      height:"38px",
                      marginRight:"10px"
                    }}
                  />

                  <div>

                    <div className="d-flex align-items-center gap-2">

                      <strong className="text-success">
                        Dr. Reuma
                      </strong>

                      <small className="text-success d-flex align-items-center">

                        <FaCheckCircle size={14} className="me-1"/>
                        Respuesta oficial

                      </small>

                    </div>

                    <div>{review.adminReply}</div>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      ))}


      {/* paginacion */}
      {totalPages > 1 && (

        <div className="  d-flex justify-content-center mt-4">

          <ul className=" pagination ">

            {[...Array(totalPages)].map((_,index)=>{

              const page = index+1;

              return (
                <li
                  key={page}
                  className={`page-item ${currentPage === page ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={()=>goToPage(page)}
                  >
                    {page}
                  </button>
                </li>
              );

            })}

          </ul>

        </div>

      )}

    </section>

  );

}
