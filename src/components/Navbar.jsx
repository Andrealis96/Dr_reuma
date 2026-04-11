import { useEffect, useState } from "react";
import { Navbar, Nav, Container, Badge, Card } from "react-bootstrap";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/Auth";
import { FaWhatsapp } from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

import {
  FaHome, FaBriefcase, FaCommentDots, FaUser, FaImages, FaBell, FaTachometerAlt, FaSignOutAlt, FaSignInAlt
} from "react-icons/fa";

import DrReumaLogo from "../assets/DrReumaLogo.svg";
import { FaHouseMedicalCircleXmark } from "react-icons/fa6";

function NavbarDrReuma() {

  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const navigate = useNavigate();

  const whatsappMessage = "Hola, solicito una consulta con el Dr.Reuma te contacto desde la pagina web. Mi nombre es ";
  const whatsappLink = `https://wa.me/5492994666559?text=${encodeURIComponent(whatsappMessage)}`;

  /* detectar admin */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(!!user);
    });
    return () => unsubscribe();
  }, []);

  /* escuchar reviews */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "reviews"), (snapshot) => {
      setReviews(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  /* detectar scroll */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
    setExpanded(false);
  };

  const closeNavbar = () => setExpanded(false);

  const goToSection = (section) => {
    navigate(`/#${section}`);
    setExpanded(false);
  };

  const unreadReviews = reviews.filter(
  r => !r.adminReply && !r.eliminado
  );

  const generarAvatar = (nombre) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || "Paciente")}&background=198754&color=fff&size=64`;

  return (

    <Navbar
      expand="lg"
      sticky="top"
      expanded={expanded}
      onToggle={(value) => setExpanded(value)}
      className={`navbar-drreuma ${scrolled ? "navbar-scrolled" : ""}`}
    >

      <Container fluid>

        {/* LOGO */}
        <Navbar.Brand
          as={RouterLink}
          to="/"
          onClick={closeNavbar}
          className="brand-drreuma"
        >
          <img
            src={DrReumaLogo}
            alt="Dr Reuma"
            className="logo-drreuma"
          />
        </Navbar.Brand>

        {/* BOTON CONSULTA */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="  navbar-consulta-btn fw-bold ad-flex"
            >
              <FaWhatsapp className="me-2"/> Solicitar consulta
            </a>
        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">

          <Nav className=" nav-links ">
          
            <Nav.Link as={RouterLink} to="/" onClick={closeNavbar}>
              <FaHome className="me-1"/> Inicio
            </Nav.Link>

            <Nav.Link onClick={() => goToSection("servicios")}>
              <FaBriefcase className="me-1"/> Servicios
            </Nav.Link>

            <Nav.Link onClick={() => goToSection("galeriaa")}>
              <FaImages className="me-1"/> Galeria
            </Nav.Link>

            <Nav.Link onClick={() => goToSection("testimonios")}>
              <FaCommentDots className="me-1"/> Testimonios
            </Nav.Link>

            <Nav.Link as={RouterLink} to="/about" onClick={closeNavbar}>
              <FaUser className="me-1"/> Nosotros
            </Nav.Link>

            

            {/* CAMPANA ADMIN */}
            {isAdmin && (
              <div style={{ position: "relative" }}>

                <Nav.Link
                  onClick={() => setShowNotifications(!showNotifications)}
                  style={{ cursor: "pointer", position: "relative" }}
                >
                  <FaBell size={20}/> Notificación

                  {unreadReviews.length > 0 && (
                    <Badge
                      bg="danger"
                      pill
                      className="position-absolute translate-middle"
                    >
                      {unreadReviews.length}
                    </Badge>
                  )}

                </Nav.Link>

                {showNotifications && (

                  <Card
                    className="shadow-sm position-absolute"
                    style={{
                      right:0,
                      top:30,
                      zIndex:1000,
                      width:300,
                      maxHeight:400,
                      overflowY:"auto"
                    }}
                  >

                    <Card.Body>

                      {unreadReviews.length === 0 ? (

                        <div className="text-center text-muted">
                          No hay nuevas notificaciones
                        </div>

                      ) : (

                        unreadReviews.map((r) => (

                          <div
                            key={r.id}
                            className="d-flex align-items-center mb-2"
                            style={{ cursor:"pointer" }}
                            onClick={()=>{
                              navigate("/admin/comentarios?filtro=noLeidos");
                              setShowNotifications(false);
                            }}
                          >

                            <img
                              src={r.photoURL || generarAvatar(r.name)}
                              alt="avatar"
                              style={{
                                width:35,
                                height:35,
                                borderRadius:"50%",
                                marginRight:10
                              }}
                            />

                            <div>

                              <strong>{r.name}</strong>

                              <div style={{ fontSize:12 }}>
                                {r.comment.slice(0,40)}
                                {r.comment.length>40?"...":""}
                              </div>

                            </div>

                          </div>

                        ))

                      )}

                    </Card.Body>

                  </Card>

                )}

              </div>
            )}

            {/* PANEL ADMIN */}
            {isAdmin && (
              <Nav.Link
                as={RouterLink}
                to="/admin"
                onClick={closeNavbar}
                style={{ fontWeight:"600", color:"#198754" }}
              >
                <FaTachometerAlt className="me-1"/> Panel Admin
              </Nav.Link>
            )}

            {/* LOGIN / LOGOUT */}
            {isAdmin ? (

              <Nav.Link onClick={handleLogout}>
                <FaSignOutAlt className="me-1"/> Cerrar sesión
              </Nav.Link>

            ) : (

              <Nav.Link as={RouterLink} to="/loginAdmin" onClick={closeNavbar}>
                <FaSignInAlt className="me-1"/> Login Admin
              </Nav.Link>

            )}

          </Nav>

        </Navbar.Collapse>

      </Container>

    </Navbar>
  );
}

export default NavbarDrReuma;