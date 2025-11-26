import { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { IoBasketballOutline, IoFootballOutline, IoPencil, IoTennisballOutline, IoTrashOutline } from 'react-icons/io5';
import { deleteCourt, updateCourt } from '../../services/api';

const CourtManagementCard = ({ court, onCourtUpdated, onCourtDeleted }) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: court.name,
        sport: court.sport.toLowerCase(),
        base_price: court.base_price,
        light_price: court.light_price || 0,
        ball_price: court.ball_price || 0,
        racket_price: court.racket_price || 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para obtener el ícono según el deporte
    const getSportIcon = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') {
            return <IoFootballOutline size={24} className="text-green-600" />;
        } else if (sportLower === 'paddle') {
            return <IoTennisballOutline size={24} className="text-blue-600" />;
        } else if (sportLower === 'basquet' || sportLower === 'básquet') {
            return <IoBasketballOutline size={24} className="text-orange-600" />;
        }
        return <IoTennisballOutline size={24} className="text-gray-600" />;
    };

    // Función para obtener el color de fondo del ícono según el deporte
    const getSportIconBg = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') return 'bg-green-50';
        if (sportLower === 'paddle') return 'bg-blue-50';
        if (sportLower === 'basquet' || sportLower === 'básquet') return 'bg-orange-50';
        return 'bg-gray-50';
    };

    const handleEditClick = () => {
        // Reiniciar el formulario con los datos actuales de la cancha
        // Normalizar el deporte a minúsculas para que coincida con los valores del select
        setEditForm({
            name: court.name,
            sport: court.sport.toLowerCase(),
            base_price: court.base_price,
            light_price: court.light_price || 0,
            ball_price: court.ball_price || 0,
            racket_price: court.racket_price || 0,
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
            [name]: (name === 'base_price' || name === 'light_price' || name === 'ball_price' || name === 'racket_price')
                ? value
                : value
        }));
    };

    return (
        <>
            {/* Bento Strip Card */}
            <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between transition-all hover:shadow-md border border-gray-100">
                {/* Icon Box */}
                <div className="flex items-center gap-4 flex-1">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${getSportIconBg(court.sport)}`}>
                        {getSportIcon(court.sport)}
                    </div>

                    {/* Info Principal */}
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-0.5">{court.name}</h3>
                        <p className="text-sm text-gray-500">
                            ${court.base_price.toLocaleString('es-AR')} / hora
                        </p>
                    </div>
                </div>

                {/* Badge */}
                <div className="hidden md:block">
                    <span className="inline-block bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full border border-gray-200 font-medium">
                        {court.sport.charAt(0).toUpperCase() + court.sport.slice(1)}
                    </span>
                </div>

                {/* Acciones - Icon Buttons */}
                <div className="flex items-center gap-2 ml-4">
                    <button
                        onClick={handleEditClick}
                        className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        title="Editar cancha"
                    >
                        <IoPencil className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                    </button>
                    <button
                        onClick={handleDeleteClick}
                        className="p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                        title="Eliminar cancha"
                    >
                        <IoTrashOutline className="w-5 h-5 text-gray-500 group-hover:text-red-600 transition-colors" />
                    </button>
                </div>
            </div>

            {/* Modal de Edición */}
            <Modal show={showEditModal} onHide={() => !loading && setShowEditModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '600' }}>Editar Cancha</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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
                            <Form.Label style={{ fontWeight: '500' }}>Precio Base</Form.Label>
                            <Form.Control
                                type="number"
                                name="base_price"
                                value={editForm.base_price}
                                onChange={handleInputChange}
                                onWheel={(e) => e.target.blur()}
                                required
                                min="0"
                                step="0.01"
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio Luz Artificial</Form.Label>
                            <Form.Control
                                type="number"
                                name="light_price"
                                value={editForm.light_price}
                                onChange={handleInputChange}
                                onWheel={(e) => e.target.blur()}
                                min="0"
                                step="0.01"
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio Pelota</Form.Label>
                            <Form.Control
                                type="number"
                                name="ball_price"
                                value={editForm.ball_price}
                                onChange={handleInputChange}
                                onWheel={(e) => e.target.blur()}
                                min="0"
                                step="0.01"
                                disabled={loading}
                                style={{ borderRadius: '8px' }}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label style={{ fontWeight: '500' }}>Precio por Raqueta</Form.Label>
                            <Form.Control
                                type="number"
                                name="racket_price"
                                value={editForm.racket_price}
                                onChange={handleInputChange}
                                onWheel={(e) => e.target.blur()}
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
