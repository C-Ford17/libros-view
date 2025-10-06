import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Book.css";
import { UserSignUp } from "../services/UserSignUp"; // ajusta ruta
import UserSignIn from "../services/UserSignIn";

const RegisterForm = ({ onSwitch }) => {
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const userSignup = new UserSignUp();
    const auth = new UserSignIn();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");

        if (!name.trim() || !address.trim() || !email.trim() || !password.trim()) {
            setError("Nombre, dirección, correo y contraseña son obligatorios.");
            return;
        }
        if (password !== confirm) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        try {
            const payload = { name, address, email, password, roles: "ROLE_USER" };
            await userSignup.saveUser(payload);
            // auto-login para iniciar sesión y redirigir
            await auth.login(email, password);
            window.dispatchEvent(new Event("auth-changed"));
            setSuccess("Usuario registrado exitosamente.");
            // limpiar campos por si volvemos a esta vista
            setName(""); setAddress(""); setEmail(""); setPassword(""); setConfirm("");
            // redirigir al home
            navigate("/");
        } catch (err) {
            setError(err?.response?.data?.message || "Error al registrar el usuario.");
        }
    };

    return (
        <div className="form-container">
            <h2>Registrarse</h2>

            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nombre"
                       value={name} onChange={(e) => setName(e.target.value)} required />

                <input type="text" placeholder="Dirección"
                       value={address} onChange={(e) => setAddress(e.target.value)} required />

                <input type="email" placeholder="Email"
                       value={email} onChange={(e) => setEmail(e.target.value)} required />

                <input type="password" placeholder="Contraseña"
                       value={password} onChange={(e) => setPassword(e.target.value)} required />

                <input type="password" placeholder="Confirmar contraseña"
                       value={confirm} onChange={(e) => setConfirm(e.target.value)} required />

                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <button type="submit">¡Vamos!</button>
            </form>

            <p>
                ¿Ya tienes una cuenta?{" "}
                {onSwitch ? (
                    <span className="link" onClick={onSwitch}>Inicia Sesión</span>
                ) : (
                    <Link className="link" to="/login">Inicia Sesión</Link>
                )}
            </p>
        </div>
    );
};

export default RegisterForm;
