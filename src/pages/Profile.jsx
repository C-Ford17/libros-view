import React, { useEffect, useRef, useState } from "react";
import api from "../api";
import "../styles/Profile.css";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    address: "",
  });

  const [userBooks, setUserBooks] = useState([]);
  const [exchangedBooks, setExchangedBooks] = useState([]);
  const [exchangeRequests, setExchangeRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // evitar doble ejecución en StrictMode
    hasFetched.current = true;

    const loadProfile = async () => {
      try {
        const userId = localStorage.getItem("user-id");
        if (!userId) {
          throw new Error("No hay sesión activa. Inicia sesión para ver tu perfil.");
        }

        const { data } = await api.get(`/api/v1/clients/${userId}`);
        const mapped = {
          name: data.name || "",
          email: data.email || "",
          address: data.address || "",
        };
        setUserInfo(mapped);

        try {
          const { data: books } = await api.get(`/api/v1/clients/${userId}/books`);
          setUserBooks(Array.isArray(books) ? books : []);
        } catch (errBooks) {
          // Silenciar errores de libros para no bloquear el perfil
          // console.warn("No se pudieron cargar los libros del usuario", errBooks);
        }
      } catch (e) {
        const status = e?.response?.status;
        let message = e?.response?.data?.message || e.message || "No se pudo cargar el perfil";
        if (status === 401) message = "Sesión expirada. Vuelve a iniciar sesión.";
        if (status === 403) message = "No tienes permisos para ver este perfil.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleAccept = (id) => {
    alert(`Intercambio aceptado para la solicitud #${id}`);
    setExchangeRequests(exchangeRequests.filter((req) => req.id !== id));
  };

  const handleReject = (id) => {
    alert(`Solicitud #${id} descartada`);
    setExchangeRequests(exchangeRequests.filter((req) => req.id !== id));
  };

  if (loading) {
    return (
      <div className="profile-container">
        <h2>Mi Perfil</h2>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <h2>Mi Perfil</h2>
        <p className="error-message">{error}</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>

      {/* Información del usuario */}
      <section className="profile-info">
        <h3>Información Personal</h3>
        <p>
          <strong>Nombre:</strong> {userInfo.name || "-"}
        </p>
        <p>
          <strong>Correo:</strong> {userInfo.email || "-"}
        </p>
        <p>
          <strong>Dirección:</strong> {userInfo.address || "-"}
        </p>
      </section>

      {/* Libros publicados */}
        <section className="profile-section">
            <h3>Libros Publicados</h3>
            <div className="books-grid">
                {userBooks.length > 0 ? (
                    userBooks.map((book) => (
                        <div key={book.id} className="book-card">
                            <h4>{book.bookDefinition?.title}</h4>
                            <p>{book.bookDefinition?.author}</p>
                            <small>Estado: {book.state}</small>
                        </div>
                    ))
                ) : (
                    <p>No has publicado ningún libro aún.</p>
                )}
            </div>
        </section>

      {/* Libros intercambiados */}
      <section className="profile-section exchanged">
        <h3>Libros Intercambiados</h3>
        <div className="books-grid">
          {exchangedBooks.length > 0 ? (
            exchangedBooks.map((book) => (
              <div key={book.id} className="book-card exchanged">
                <h4>{book.title}</h4>
                <p>{book.author}</p>
              </div>
            ))
          ) : (
            <p>No has realizado intercambios todavía.</p>
          )}
        </div>
      </section>

      {/* Solicitudes de intercambio */}
      <section className="profile-section requests">
        <h3>Solicitudes de Intercambio</h3>
        {exchangeRequests.length > 0 ? (
          <div className="requests-list">
            {exchangeRequests.map((req) => (
              <div key={req.id} className="request-card">
                <p>
                  <strong>Usuario:</strong> {req.requester}
                </p>
                <p>
                  <strong>Libro Solicitado:</strong> {req.book}
                </p>
                <div className="request-buttons">
                  <button
                    className="btn-accept"
                    onClick={() => handleAccept(req.id)}
                  >
                    Aceptar
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(req.id)}
                  >
                    Descartar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No tienes solicitudes pendientes.</p>
        )}
      </section>
    </div>
  );
};

export default Profile;
