import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api.js';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import FormField from '../components/FormField.jsx';
import AuthLink from '../components/AuthLink.jsx';

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleRegistrarse = async (e) => {
        e.preventDefault();
        try {
            await register(email, nombre, password);
            console.log("Usuario creado con éxito");
            alert("¡Registro exitoso! Ahora puedes iniciar sesión.");
            
            // Redirigir al login
            navigate('/');
        } catch (error) {
            console.error("Error al crear usuario:", error);
            alert("Error al crear usuario. Por favor intenta nuevamente.");
        }
    };

    return (
        <AuthCard>
            <AuthForm
                title="Registrarse"
                onSubmit={handleRegistrarse}
                submitText="Registrarse"
                submitVariant="dark"
            >
                <FormField
                    label="Nombre completo"
                    type="text"
                    placeholder="Ingresar nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    controlId="formBasicName"
                />
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
                    text="¿Ya tienes una cuenta?"
                    linkText="Iniciar sesión"
                    to="/"
                    controlId="formBasicLoginLink"
                />
            </AuthForm>
        </AuthCard>    
    );
};

export default Register;