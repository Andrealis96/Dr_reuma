import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/Auth";
import { useNavigate } from "react-router-dom";

import DrReumaLogo from "../assets/DrReumaLogo.svg";

function LoginAdmin() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);

    try {

      await signInWithEmailAndPassword(auth, email, password);

      navigate("/admin");

    } catch {

      setError("Email o contraseña incorrectos");

    }

    setLoading(false);

  };


  return (

    <div className="container py-20">

      <div className="row justify-content-center align-items-center min-vh-100">

        <div className="col-11 col-sm-8 col-md-6 col-lg-6">

          <div className="card shadow border-0">

            <div className="card-body">

              <div className="text-center mb-4">

                <img
                  src={DrReumaLogo}
                  alt="Dr Reuma"
                  style={{ width: "100px" }}
                />

                <h6 className="mt-3 fw-bold subtitle-general">
                  <span className="subtitle-celeste">ACCESO</span>
                  <span className="subtitle-negro"> ADMINISTRATIVO</span>
                </h6>

              </div>


              <form onSubmit={handleLogin}>

                <div className="mb-3">

                  <input
                    type="email"
                    className="form-control"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                </div>


                <div className="mb-3">

                  <input
                    type="password"
                    className="form-control"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                </div>


                {error && (
                  <div className="alert alert-danger py-2">
                    {error}
                  </div>
                )}


                <button
                  className="btn btn-success w-100"
                  disabled={loading}
                >

                  {loading ? "Ingresando..." : "Ingresar"}

                </button>

              </form>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default LoginAdmin;