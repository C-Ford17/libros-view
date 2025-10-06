import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm.jsx";
import RegisterForm from "./RegisterForm.jsx";
import "../styles/Book.css";

const Book = () => {
  const [flipped, setFlipped] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Sincroniza el lado visible con la ruta actual
  useEffect(() => {
    const isRegister = location.pathname === "/register";
    setFlipped(isRegister);
  }, [location.pathname]);

  // Handlers para alternar con animación y navegar a la ruta correspondiente
  const goToRegister = () => {
    setFlipped(true);
    // esperar un poco para que se vea el flip antes de cambiar la ruta
    setTimeout(() => navigate("/register"), 300);
  };
  const goToLogin = () => {
    setFlipped(false);
    setTimeout(() => navigate("/login"), 300);
  };

  return (
    <div className="book-container">
      <div className="book">
        {/* Página izquierda fija (logo) */}
        <div className="page left">
          {/* <img src={logo} alt="Logo" className="logo" /> */}
          <div className="logo-placeholder">Logo</div>
        </div>

        {/* Página derecha que gira */}
        <div className={`page-right ${flipped ? "flipped" : ""}`}>
          <div className="page-front">
            <LoginForm onSwitch={goToRegister} />
          </div>
          <div className="page-back">
            <RegisterForm onSwitch={goToLogin} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
