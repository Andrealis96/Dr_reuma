import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/Auth";
import { useNavigate } from "react-router-dom";

import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUserMd,
  FaSignInAlt
} from "react-icons/fa";

function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      navigate("/admin");
    } catch (error) {
      console.error("Error login:", error);

      setError(
        "Correo electrónico o contraseña incorrectos."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-medico-page">

      <div className="login-medico-card">

        {/* CABECERA */}
        <div className="login-medico-header">

          <div className="login-medico-logo-wrap">
            <img
              src="/DrReumaLogo.svg"
              alt="Dr. Reuma"
              className="login-medico-logo"
            />
          </div>

          <div className="login-medico-badge">
            <FaUserMd />
            Acceso profesional
          </div>

          <h1 className="login-medico-title">
            <span>INGRESO</span>
            <strong>MÉDICO</strong>
          </h1>

          <p className="login-medico-subtitle">
            Acceso exclusivo al panel administrativo de Dr. Reuma.
          </p>

        </div>


        {/* FORMULARIO */}
        <form
          onSubmit={handleLogin}
          className="login-medico-form"
        >

          {/* EMAIL */}
          <div className="login-medico-field">

            <label>
              Correo electrónico
            </label>

            <div className="login-medico-input-wrap">

              <span className="login-medico-input-icon">
                <FaEnvelope />
              </span>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

            </div>

          </div>


          {/* PASSWORD */}
          <div className="login-medico-field">

            <label>
              Contraseña
            </label>

            <div className="login-medico-input-wrap">

              <span className="login-medico-input-icon">
                <FaLock />
              </span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-medico-password-toggle"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>

            </div>

          </div>


          {/* ERROR */}
          {error && (
            <div className="login-medico-error">
              {error}
            </div>
          )}


          {/* BOTÓN */}
          <button
            type="submit"
            className="login-medico-submit"
            disabled={loading}
          >

            {loading ? (
              <>
                <span className="login-medico-spinner" />
                Ingresando...
              </>
            ) : (
              <>
                <FaSignInAlt />
                Ingresar al panel
              </>
            )}

          </button>

        </form>


        {/* PIE */}
        <div className="login-medico-footer">
          <FaLock />
          Acceso protegido · Dr. Reuma
        </div>

      </div>

    </section>
  );
}

export default LoginAdmin;