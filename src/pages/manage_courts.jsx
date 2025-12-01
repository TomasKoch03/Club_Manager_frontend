import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import CourtManagementCard from '../components/courts/CourtManagementCard';
import { createCourt, getCourts } from '../services/api';

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
        });
        setCreateError(null);
        setShowCreateModal(true);
    };

    const handleCreateInputChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({
            ...prev,
            [name]: value
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
            padding: "16px 32px 60px 32px"
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
                    /* Ocultar botones de incremento/decremento en inputs de tipo number */
                    input[type="number"]::-webkit-inner-spin-button,
                    input[type="number"]::-webkit-outer-spin-button {
                        -webkit-appearance: none;
                        margin: 0;
                    }
                    input[type="number"] {
                        -moz-appearance: textfield;
                        appearance: textfield;
                    }
                `}
            </style>
            <div className="max-w-6xl mx-auto pb-20 courts-container">
                {/* HEADER - Toolbar Horizontal */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        {/* Título */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Canchas</h1>
                            <p className="text-sm text-gray-500">Administra las canchas del club</p>
                        </div>

                        {/* Action Area - Filtro y botón */}
                        <div className="flex items-center gap-3 w-full md:w-auto">
                            {/* Filtro por deporte */}
                            <select
                                value={selectedSport}
                                onChange={handleSportFilterChange}
                                className="flex-1 md:flex-none h-10 px-3 bg-white border-none shadow-sm rounded-lg text-sm font-medium text-gray-900 ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="">Todos los deportes</option>
                                <option value="futbol">Fútbol</option>
                                <option value="paddle">Paddle</option>
                                <option value="basquet">Básquet</option>
                            </select>

                            {/* Botón Nueva Cancha */}
                            <button
                                onClick={handleCreateClick}
                                className="h-10 px-4 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 transition-all shadow-sm whitespace-nowrap"
                            >
                                + Nueva Cancha
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando canchas...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                        {error}
                    </div>
                )}

                {/* Lista de canchas - BENTO STRIPS */}
                {!loading && !error && (
                    <>
                        {courts.length === 0 ? (
                            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                <p className="text-gray-600 text-lg">
                                    No hay canchas registradas
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
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
            </div>

            {/* Modal de Creación de Cancha */}
            <Modal show={showCreateModal} onHide={() => !createLoading && setShowCreateModal(false)} centered>
                <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
                    <Modal.Title style={{ fontWeight: '600' }}>Nueva Cancha</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
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
                                onWheel={(e) => e.target.blur()}
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
                                onWheel={(e) => e.target.blur()}
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
