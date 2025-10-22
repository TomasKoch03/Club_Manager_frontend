import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button } from 'react-bootstrap';
import fondo from '../assets/fondo_landing_page.jpg';

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
        <div
            className="fixed inset-0 overflow-hidden p-0 m-0"
            style={{
                backgroundImage: `url(${fondo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div className="absolute inset-0 filter backdrop-blur-md bg-black/30" />

            <div className="relative z-10 w-full h-full flex items-center justify-center">
                <Container fluid className="p-0 flex items-center justify-center">
                    <Card
                        style={{
                            width: 'min(80vw, 600px)',
                            height: 'min(80vw, 500px)',
                            backgroundColor: 'rgba(255,255,255,0.75)',
                            border: 'none',
                            borderRadius: '1rem',
                            boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                        }}
                        className="d-flex align-items-center justify-content-center text-center"
                    >
                        <div className='justify-items-start items-start' style={{ padding: '1.5rem', width: '100%' }}>
                            <h2 className="mb-3">Iniciar sesión</h2>
                            <Form className='w-100 h-100' onSubmit={handleIngresar}>
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
                                    Ingresar
                                </Button>

                                <Form.Group className="text-center mb-3">
                                    <p> ¿No tienes una cuenta? <Link to="registrar">Regístrate</Link> </p>
                                </Form.Group>
                            </Form>
                        </div>
                    </Card>
                </Container>
            </div>
        </div>
    );
};

export default Overlay;