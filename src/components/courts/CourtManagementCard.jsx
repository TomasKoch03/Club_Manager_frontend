import { useState } from 'react';
import { Badge, Button, Card, Col, Row, Modal, Form } from 'react-bootstrap';
import { IoTennisballOutline, IoFootballOutline, IoBasketballOutline, IoPricetagOutline } from 'react-icons/io5';
import { MdSportsTennis } from 'react-icons/md';
import { updateCourt, deleteCourt } from '../../services/api';

const CourtManagementCard = ({ court, onCourtUpdated, onCourtDeleted }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: court.name,
        sport: court.sport.toLowerCase(),
        amount: court.amount,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener el ícono según el deporte
    const getSportIcon = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') {
            return <IoFootballOutline size={20} style={{ marginRight: '8px', marginBottom: '2px' }} />;
        } else if (sportLower === 'paddle') {
            return <IoTennisballOutline size={20} style={{ marginRight: '8px', marginBottom: '2px' }} />;
        } else if (sportLower === 'basquet' || sportLower === 'básquet') {
            return <IoBasketballOutline size={20} style={{ marginRight: '8px', marginBottom: '2px' }} />;
        }
        return <MdSportsTennis size={20} style={{ marginRight: '8px', marginBottom: '2px' }} />;
    };

    // Función para obtener el color del badge según el deporte
    const getSportBadgeColor = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') return 'success';
        if (sportLower === 'paddle') return 'info';
        if (sportLower === 'basquet' || sportLower === 'básquet') return 'warning';
        return 'secondary';
    };

    const handleEditClick = () => {
        // Reiniciar el formulario con los datos actuales de la cancha
        // Normalizar el deporte a minúsculas para que coincida con los valores del select
        setEditForm({
            name: court.name,
            sport: court.sport.toLowerCase(),
            amount: court.amount,
        });
        setShowEditModal(true);
        setError(null);
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
        setError(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await updateCourt(court.id, editForm);
            setShowEditModal(false);
            if (onCourtUpdated) {
                onCourtUpdated();
            }
        } catch (err) {
            console.error('Error al actualizar cancha:', err);
            setError(err.detail || 'Error al actualizar la cancha. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        setLoading(true);
        setError(null);

        try {
            await deleteCourt(court.id);
            setShowDeleteModal(false);
            if (onCourtDeleted) {
                onCourtDeleted();
            }
        } catch (err) {
            console.error('Error al eliminar cancha:', err);
            setError(err.detail || 'Error al eliminar la cancha. Por favor, intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) : value
        }));
    };

    return (
        <>
            <Card
                style={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                    border: "none",
                    marginBottom: "16px",
                }}
            >
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col xs={12} md={5}>
                            {/* Nombre de la cancha */}
                            <div className="mb-3">
                                <h5 className="mb-1" style={{ fontWeight: '600', color: '#000' }}>
                                    {getSportIcon(court.sport)}
                                    {court.name}
                                </h5>
                            </div>

                            {/* Precio */}
                            <div className="mb-2">
                                <IoPricetagOutline size={18} style={{ marginRight: '8px', color: '#6c757d' }} />
                                <span style={{ color: '#495057', fontSize: '0.95rem' }}>
                                    ${court.amount.toLocaleString('es-AR')}
                                </span>
                            </div>
                        </Col>

                        <Col xs={12} md={3} className="d-flex justify-content-md-center mt-3 mt-md-0">
                            {/* Deporte */}
                            <Badge
                                bg={getSportBadgeColor(court.sport)}
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    padding: '10px 24px',
                                    borderRadius: '12px',
                                    minWidth: '140px',
                                    textAlign: 'center',
                                }}
                            >
                                {court.sport}
                            </Badge>
                        </Col>

                        <Col xs={12} md={4} className="d-flex justify-content-end gap-2 mt-3 mt-md-0">
                            {/* Botones de acción */}
                            <Button
                                variant="outline-dark"
                                size="sm"
                                onClick={handleEditClick}
                                style={{
                                    minWidth: '100px',
                                    fontWeight: '500',
                                }}
                            >
                                Modificar
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={handleDeleteClick}
                                style={{
                                    minWidth: '100px',
                                    fontWeight: '500',
                                }}
                            >
                                Eliminar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Modal de Edición */}
            <Modal show={showEditModal} onHide={() => !loading && setShowEditModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '600' }}>Editar Cancha</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Nombre de la Cancha</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Deporte</Form.Label>
                            <Form.Select
                                name="sport"
                                value={editForm.sport}
                                onChange={handleInputChange}
                                required
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            >
                                <option value="futbol">Fútbol</option>
                                <option value="paddle">Paddle</option>
                                <option value="basquet">Básquet</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio</Form.Label>
                            <Form.Control
                                type="number"
                                name="amount"
                                value={editForm.amount}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowEditModal(false)}
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                variant="dark"
                                type="submit"
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal de Confirmación de Eliminación */}
            <Modal show={showDeleteModal} onHide={() => !loading && setShowDeleteModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '600', color: '#dc3545' }}>
                        Confirmar Eliminación
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}
                    <p style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                        ¿Estás seguro que deseas eliminar la cancha <strong>{court.name}</strong>?
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#6c757d', marginBottom: '0' }}>
                        Esta acción no se puede deshacer.
                    </p>
                </Modal.Body>
                <Modal.Footer style={{ borderTop: '1px solid #dee2e6' }}>
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowDeleteModal(false)}
                        disabled={loading}
                        style={{ borderRadius: '8px' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteConfirm}
                        disabled={loading}
                        style={{ borderRadius: '8px' }}
                    >
                        {loading ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default CourtManagementCard;
