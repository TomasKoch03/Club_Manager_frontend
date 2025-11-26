import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Alert, Container, Spinner, Form, Row, Col, Button, Modal } from 'react-bootstrap';
import CourtManagementCard from '../components/courts/CourtManagementCard';
import { getCourts, createCourt } from '../services/api';

const ManageCourts = () => {
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSport, setSelectedSport] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        sport: 'futbol',
        base_price: '',
        light_price: 0,
        ball_price: 0,
        racket_price: 0,
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState(null);

    const fetchCourts = async (sport = '') => {
        try {
            setLoading(true);
            const data = await getCourts(sport || null);
            // Ordenar por deporte y luego por nombre
            const sortedData = data.sort((a, b) => {
                if (a.sport !== b.sport) {
                    return a.sport.localeCompare(b.sport);
                }
                return a.name.localeCompare(b.name);
            });
            setCourts(sortedData);
            setError(null);
        } catch (err) {
            console.error('Error al cargar canchas:', err);
            setError('No se pudieron cargar las canchas. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourts(selectedSport);
    }, [selectedSport]);

    const handleCourtUpdated = () => {
        // Recargar la lista después de actualizar una cancha
        fetchCourts(selectedSport);
    };

    const handleCourtDeleted = () => {
        // Recargar la lista después de eliminar una cancha
        fetchCourts(selectedSport);
    };

    const handleSportFilterChange = (e) => {
        setSelectedSport(e.target.value);
    };

    const handleCreateClick = () => {
        setCreateForm({
            name: '',
            sport: 'futbol',
            base_price: '',
            light_price: 0,
            ball_price: 0,
            racket_price: 0,
        });
        setCreateError(null);
        setShowCreateModal(true);
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({
            ...prev,
            [name]: (name === 'base_price' || name === 'light_price' || name === 'ball_price' || name === 'racket_price') 
                ? value 
                : value
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreateLoading(true);
        setCreateError(null);

        try {
            await createCourt({
                name: createForm.name,
                sport: createForm.sport,
                base_price: parseFloat(createForm.base_price),
                light_price: parseFloat(createForm.light_price) || 0,
                ball_price: parseFloat(createForm.ball_price) || 0,
                racket_price: parseFloat(createForm.racket_price) || 0,
            });
            setShowCreateModal(false);
            fetchCourts(selectedSport);
        } catch (err) {
            console.error('Error al crear cancha:', err);
            setCreateError(err.detail || 'Error al crear la cancha. Por favor, intenta nuevamente.');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div style={{
            height: 'calc(100vh - 80px)',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: "40px 20px 60px 20px"
        }}>
            <style>
                {`
                    .courts-container::-webkit-scrollbar {
                        width: 10px;
                    }
                    .courts-container::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .courts-container::-webkit-scrollbar-thumb {
                        background-color: rgba(0, 0, 0, 0.3);
                        border-radius: 10px;
                        border: 2px solid transparent;
                        background-clip: padding-box;
                    }
                    .courts-container::-webkit-scrollbar-thumb:hover {
                        background-color: rgba(0, 0, 0, 0.5);
                    }
                `}
            </style>
            <Container style={{ maxWidth: "900px" }} className="courts-container">
                {/* Título */}
                <div
                    style={{
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "16px",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                        border: "none",
                        padding: "24px",
                        marginBottom: "24px",
                    }}
                >
                    <Row className="align-items-center">
                        <Col xs={12} md={6}>
                            <h2 className="mb-0" style={{ fontWeight: '600', color: '#000' }}>
                                Gestión de Canchas
                            </h2>
                            <p className="text-muted mb-0 mt-2" style={{ fontSize: '0.95rem' }}>
                                Administra las canchas del club y su información
                            </p>
                        </Col>
                        <Col xs={12} md={3} className="mt-3 mt-md-0">
                            <Form.Group>
                                <Form.Label style={{ fontWeight: '500', fontSize: '0.9rem', marginBottom: '8px' }}>
                                    Filtrar por deporte
                                </Form.Label>
                                <Form.Select
                                    value={selectedSport}
                                    onChange={handleSportFilterChange}
                                    style={{
                                        borderRadius: '8px',
                                        border: '2px solid #000',
                                        fontWeight: '500',
                                    }}
                                >
                                    <option value="">Todos los deportes</option>
                                    <option value="futbol">Fútbol</option>
                                    <option value="paddle">Paddle</option>
                                    <option value="basquet">Básquet</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={3} className="mt-3 mt-md-0 d-flex align-items-end">
                            <Button
                                variant="dark"
                                onClick={handleCreateClick}
                                style={{
                                    width: '100%',
                                    borderRadius: '8px',
                                    fontWeight: '500',
                                    padding: '10px',
                                }}
                            >
                                + Nueva Cancha
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="dark" />
                        <p className="mt-3" style={{ color: '#000' }}>Cargando canchas...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <Alert variant="danger" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
                        {error}
                    </Alert>
                )}

                {/* Lista de canchas */}
                {!loading && !error && (
                    <>
                        {courts.length === 0 ? (
                            <div
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "16px",
                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                    border: "none",
                                    padding: "48px 24px",
                                    textAlign: "center",
                                }}
                            >
                                <p style={{ color: '#6c757d', fontSize: '1.1rem', marginBottom: '0' }}>
                                    No hay canchas registradas
                                </p>
                            </div>
                        ) : (
                            <div>
                                {courts.map((court) => (
                                    <CourtManagementCard
                                        key={court.id}
                                        court={court}
                                        onCourtUpdated={handleCourtUpdated}
                                        onCourtDeleted={handleCourtDeleted}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </Container>

            {/* Modal de Creación de Cancha */}
            <Modal show={showCreateModal} onHide={() => !createLoading && setShowCreateModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '600' }}>Nueva Cancha</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {createError && (
                        <div className="alert alert-danger" role="alert">
                            {createError}
                        </div>
                    )}
                    <Form onSubmit={handleCreateSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Nombre de la Cancha</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={createForm.name}
                                onChange={handleCreateInputChange}
                                placeholder="Ej: Cancha 1, Cancha Principal..."
                                required
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Deporte</Form.Label>
                            <Form.Select
                                name="sport"
                                value={createForm.sport}
                                onChange={handleCreateInputChange}
                                required
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            >
                                <option value="futbol">Fútbol</option>
                                <option value="paddle">Paddle</option>
                                <option value="basquet">Básquet</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio Base</Form.Label>
                            <Form.Control
                                type="number"
                                name="base_price"
                                value={createForm.base_price}
                                onChange={handleCreateInputChange}
                                placeholder="0.00"
                                required
                                min="0"
                                step="0.01"
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio Luz Artificial</Form.Label>
                            <Form.Control
                                type="number"
                                name="light_price"
                                value={createForm.light_price}
                                onChange={handleCreateInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            />
                            <Form.Text className="text-muted">
                                Opcional. Dejar en 0 si no se ofrece.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio Pelota</Form.Label>
                            <Form.Control
                                type="number"
                                name="ball_price"
                                value={createForm.ball_price}
                                onChange={handleCreateInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            />
                            <Form.Text className="text-muted">
                                Opcional. Dejar en 0 si no se ofrece.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio por Raqueta</Form.Label>
                            <Form.Control
                                type="number"
                                name="racket_price"
                                value={createForm.racket_price}
                                onChange={handleCreateInputChange}
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            />
                            <Form.Text className="text-muted">
                                Opcional. Dejar en 0 si no se ofrece.
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowCreateModal(false)}
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="dark"
                                type="submit"
                                disabled={createLoading}
                                style={{ borderRadius: '8px' }}
                            >
                                {createLoading ? 'Creando...' : 'Crear Cancha'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default ManageCourts;
