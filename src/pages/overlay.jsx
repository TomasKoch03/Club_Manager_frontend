import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api.js';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import FormField from '../components/FormField.jsx';
import AuthLink from '../components/AuthLink.jsx';

const Overlay = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleIngresar = async (e) => {
        e.preventDefault();
        try {
            const data = await login(email, password);
            console.log("Login exitoso:", data);
            
            // Redirigir a /club-manager/home
            navigate('/club-manager/home');
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            alert("Error al iniciar sesión. Por favor verifica tus credenciales.");
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