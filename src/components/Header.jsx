import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import UserSignIn from "../services/UserSignIn";

const Header = () => {
  const [isAuth, setIsAuth] = useState(!!localStorage.getItem("auth-token"));
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => {
      setIsAuth(!!localStorage.getItem("auth-token"));
    };
    window.addEventListener("auth-changed", handler);
    return () => window.removeEventListener("auth-changed", handler);
  }, []);

  const handleLogout = () => {
    const auth = new UserSignIn();
    auth.clearToken();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>
              <Link to="/" className="home-link">📚 BiblioIntercambio</Link>
            </h1>
          </div>
          <nav className="navigation">
            <div className="nav-links">
              <Link to="/">Inicio</Link>
              <a href="#books">Libros Disponibles</a>
              <a href="#how-it-works">¿Cómo Funciona?</a>
              <Link to="/profile">Mi perfil</Link>
            </div>
            {isAuth ? (
              <div className="auth-buttons">
                <button className="btn-login btn-logout" onClick={handleLogout}>Cerrar sesión</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login">
                  <button className="btn-login">Iniciar Sesión</button>
                </Link>
                <Link to="/register">
                  <button className="btn-register">Registrarse</button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
