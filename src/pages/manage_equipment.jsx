import { useState, useEffect } from 'react';
import { Container, Button, Form, Modal } from 'react-bootstrap';
import { useToast } from '../hooks/useToast';
import { getEquipment, createEquipment, updateEquipment } from '../services/api';
import { IoAdd, IoBasketballOutline, IoFootballOutline, IoTennisballOutline } from 'react-icons/io5';
import { formatCurrency } from '../utils/formatCurrency';

const ManageEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [filteredEquipment, setFilteredEquipment] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingEquipment, setEditingEquipment] = useState(null);
    const [filters, setFilters] = useState({
        sport: '',
        name: ''
    });
    const [formData, setFormData] = useState({
        name: '',
        sport: 'futbol',
        stock: 0,
        price_per_unit: 0
    });
    const toast = useToast();

    useEffect(() => {
        fetchEquipment();
    }, []);

    // Aplicar filtros cuando cambian
    useEffect(() => {
        applyFilters();
    }, [equipment, filters]);

    const fetchEquipment = async () => {
        try {
            setLoading(true);
            const data = await getEquipment();
            setEquipment(data);
        } catch (error) {
            console.error('Error al cargar equipamientos:', error);
            toast.error('Error al cargar equipamientos');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...equipment];

        // Normalizar string removiendo acentos
        const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Filtrar por deporte
        if (filters.sport && filters.sport !== 'todos') {
            filtered = filtered.filter(item => 
                normalize(item.sport) === normalize(filters.sport)
            );
        }

        // Filtrar por nombre (búsqueda parcial)
        if (filters.name.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }

        setFilteredEquipment(filtered);
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleShowModal = (equipment = null) => {
        if (equipment) {
            setEditingEquipment(equipment);
            setFormData({
                name: equipment.name,
                sport: equipment.sport.toLowerCase(),
                stock: equipment.stock,
                price_per_unit: equipment.price_per_unit
            });
        } else {
            setEditingEquipment(null);
            setFormData({
                name: '',
                sport: 'futbol',
                stock: 0,
                price_per_unit: 0
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEquipment(null);
        setFormData({
            name: '',
            sport: 'futbol',
            stock: 0,
            price_per_unit: 0
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'stock' || name === 'price_per_unit') 
                ? parseFloat(value) || 0 
                : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            if (editingEquipment) {
                await updateEquipment(editingEquipment.id, formData);
                toast.success('Equipamiento actualizado exitosamente');
            } else {
                await createEquipment(formData);
                toast.success('Equipamiento creado exitosamente');
            }
            
            handleCloseModal();
            fetchEquipment();
        } catch (error) {
            console.error('Error al guardar equipamiento:', error);
            toast.error(error.detail || 'Error al guardar equipamiento');
        } finally {
            setLoading(false);
        }
    };

    const getSportIcon = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') {
            return <IoFootballOutline size={32} className="text-green-600" />;
        } else if (sportLower === 'paddle') {
            return <IoTennisballOutline size={32} className="text-yellow-600" />;
        } else if (sportLower === 'basquet' || sportLower === 'básquet') {
            return <IoBasketballOutline size={32} className="text-orange-600" />;
        }
        return <IoTennisballOutline size={32} className="text-gray-600" />;
    };

    const getSportIconBg = (sport) => {
        const sportLower = sport.toLowerCase();
        if (sportLower === 'futbol' || sportLower === 'fútbol') return 'bg-green-50';
        if (sportLower === 'paddle') return 'bg-yellow-50';
        if (sportLower === 'basquet' || sportLower === 'básquet') return 'bg-orange-50';
        return 'bg-gray-50';
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <Container className="py-4">
                {/* Header Card Blanca */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-100">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Equipamientos</h1>
                            <p className="text-sm text-gray-500">Administra los equipamientos del club</p>
                        </div>
                        <Button 
                            variant="dark" 
                            onClick={() => handleShowModal()}
                            className="d-flex align-items-center gap-2"
                            style={{ borderRadius: '8px' }}
                        >
                            <IoAdd size={20} />
                            Nuevo Equipamiento
                        </Button>
                    </div>

                    {/* Filtros */}
                    <div className="row g-3">
                        <div className="col-12 col-md-6">
                            <Form.Group>
                                <Form.Label className="text-sm font-medium text-gray-700">Buscar por nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar equipamiento..."
                                    value={filters.name}
                                    onChange={(e) => handleFilterChange('name', e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Group>
                        </div>
                        <div className="col-12 col-md-6">
                            <Form.Group>
                                <Form.Label className="text-sm font-medium text-gray-700">Filtrar por deporte</Form.Label>
                                <Form.Select
                                    value={filters.sport}
                                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                                    style={{ borderRadius: '8px' }}
                                >
                                    <option value="">Todos los deportes</option>
                                    <option value="futbol">Fútbol</option>
                                    <option value="paddle">Paddle</option>
                                    <option value="basquet">Básquet</option>
                                </Form.Select>
                            </Form.Group>
                        </div>
                    </div>
                </div>

                {loading && equipment.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                ) : filteredEquipment.length === 0 ? (
                    <div className="text-center py-5">
                        <p className="text-muted">
                            {filters.name || filters.sport ? 'No se encontraron equipamientos con los filtros aplicados' : 'No hay equipamientos registrados'}
                        </p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {filteredEquipment.map((item) => (
                            <div key={item.id} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100" style={{ borderRadius: '12px' }}>
                                    <div className="card-body">
                                        <div className="d-flex align-items-start justify-content-between mb-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div 
                                                    className={`d-flex align-items-center justify-content-center ${getSportIconBg(item.sport)}`}
                                                    style={{ 
                                                        width: '60px',
                                                        height: '60px',
                                                        borderRadius: '12px'
                                                    }}
                                                >
                                                    {getSportIcon(item.sport)}
                                                </div>
                                                <div>
                                                    <h5 className="mb-1 fw-bold">{item.name}</h5>
                                                    <span className="badge bg-secondary">
                                                        {item.sport.charAt(0).toUpperCase() + item.sport.slice(1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-column gap-2 mt-3">
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Precio por unidad:</span>
                                                <span className="fw-semibold">${formatCurrency(item.price_per_unit)}</span>
                                            </div>
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Stock disponible:</span>
                                                <span className={`fw-semibold ${item.stock > 0 ? 'text-success' : 'text-danger'}`}>
                                                    {item.stock} unidades
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-top">
                                            <Button 
                                                variant="outline-dark" 
                                                size="sm"
                                                onClick={() => handleShowModal(item)}
                                                className="w-100"
                                                style={{ borderRadius: '8px' }}
                                            >
                                                Editar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal de Creación/Edición */}
                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton style={{ borderBottom: '1px solid #dee2e6' }}>
                        <Modal.Title style={{ fontWeight: '600' }}>
                            {editingEquipment ? 'Editar Equipamiento' : 'Nuevo Equipamiento'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: '500' }}>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Ej: Pelota de fútbol"
                                    disabled={loading}
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: '500' }}>Deporte</Form.Label>
                                <Form.Select
                                    name="sport"
                                    value={formData.sport}
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
                                <Form.Label style={{ fontWeight: '500' }}>Stock</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    onWheel={(e) => e.target.blur()}
                                    required
                                    min="0"
                                    step="1"
                                    disabled={loading}
                                    style={{ borderRadius: '8px' }}
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label style={{ fontWeight: '500' }}>Precio por Unidad</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price_per_unit"
                                    value={formData.price_per_unit}
                                    onChange={handleInputChange}
                                    onWheel={(e) => e.target.blur()}
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
                                    onClick={handleCloseModal}
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
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </div>
                        </Form>
                    </Modal.Body>
                </Modal>
            </Container>
        </div>
    );
};

export default ManageEquipment;
