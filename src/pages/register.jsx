import { React, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import fondo from '../assets/fondo_landing_page.jpg';
import BackgroundLayout from '../components/BackgroundLayout';
import AuthCard from '../components/AuthCard.jsx';

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
                <div className='justify-items-start items-start' style={{ padding: '1.5rem', width: '100%' }}>
                    <h2 className="mb-3">Registrarse</h2>
                    <Form className='w-100 h-100' onSubmit={handleRegistrarse}>
                        <Form.Group className="text-start mb-3" controlId="formBasicName">
                            <Form.Label>Nombre completo</Form.Label>
                            <Form.Control type="text" placeholder="Ingresar nombre" value={nombre}
                                onChange={(e) => setNombre(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="text-start mb-3" controlId="formBasicEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control type="email" placeholder="Ingresar email" value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                        </Form.Group>

                        <Form.Group className="text-start mb-3" controlId="formBasicPassword">
                            <Form.Label>Contraseña</Form.Label>
                            <Form.Control type="password" placeholder="Ingresar contraseña" value={password}
                                onChange={(e) => setPassword(e.target.value)} />
                        </Form.Group>

                        <Button className='m-4 px-5' variant="dark" type="submit">
                            Registrarse
                        </Button>

                        <Form.Group className="text-center mb-3" controlId="formHaveAccount">
                            <p>
                                ¿Ya tienes una cuenta? <Link to="/">Inicia sesión</Link>
                            </p>
                        </Form.Group>

                    </Form>
                </div>
            </AuthCard>
        </BackgroundLayout>
    );
};

export default Register;