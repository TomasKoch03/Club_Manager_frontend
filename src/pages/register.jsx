import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import BackgroundLayout from '../components/BackgroundLayout';
import AuthCard from '../components/AuthCard.jsx';
import AuthForm from '../components/AuthForm.jsx';
import FormField from '../components/FormField.jsx';
import { Form } from 'react-bootstrap';

const Register = () => {
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegistrarse = async (e) => {
        e.preventDefault(); // evita que el formulario recargue la página
        try {
            const response = await fetch("http://localhost:8001/auth/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    full_name: nombre,
                    password: password
                })
            });

            if (response.status !== 201) {
                const errorText = await response.text().catch(() => null);
                throw new Error(errorText || 'Register failed');
            }
            console.log("Usuario creado con éxito");

        } catch (error) {
            console.error("Error crear usuario:", error);
            alert("Error al crear usuario");
        }
    }

    return (
        <BackgroundLayout>
            <AuthCard>
                <AuthForm
                    title="Registrarse"
                    onSubmit={handleRegistrarse}
                    submitText="Registrarse"
                    submitVariant=""
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
                        value={email} onChange={(e) => setEmail(e.target.value)}
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

                    <Form.Group className="text-center mb-3" controlId="formHaveAccount">
                        <p>
                            ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
                        </p>
                    </Form.Group>
                </AuthForm>
            </AuthCard>
        </BackgroundLayout>
    );
};

export default Register;