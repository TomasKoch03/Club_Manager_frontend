import React, { useState } from 'react';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import FormField from '../components/FormField.jsx';
import AuthLink from '../components/AuthLink.jsx';

const Overlay = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [accessToken, setAccessToken] = useState('');

    const handleIngresar = async (e) => {
        e.preventDefault(); // evita que el formulario recargue la página
        try {
            const response = await fetch("http://localhost:8001/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error("Login failed");
            const data = await response.json();
            // el backend responde { access_token: "..."} — aceptar ambas formas por seguridad
            const token = data.access_token || data.accessToken || data.accessToken?.accessToken || null;
            setAccessToken(token);
            console.log("Token de acceso:", token);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión");
        }
    };

    return (
            <AuthCard>
                <AuthForm
                    title="Iniciar sesión"
                    onSubmit={handleIngresar}
                    submitText="Ingresar"
                    submitVariant="dark"
                >
                    <FormField
                        label="Email"
                        type="email"
                        placeholder="Ingresar email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        controlId="formBasicEmail"
                    />
                    <FormField
                        label="Contraseña"
                        type="password"
                        placeholder="Ingresar contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        controlId="formBasicPassword"
                    />

                    <AuthLink
                        text="¿No tienes una cuenta?"
                        linkText="Regístrate"
                        to="/registrar"
                        controlId="formNoAccount"
                    />
                </AuthForm>
            </AuthCard>
    
    );
};

export default Overlay;