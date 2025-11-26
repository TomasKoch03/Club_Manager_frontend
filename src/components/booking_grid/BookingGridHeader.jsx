import { Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { IoInformationCircleOutline } from 'react-icons/io5';

const BookingGridHeader = ({ sport, selectedDate, formatDate, onPrevDate, onNextDate }) => {
    return (
        <>
            <Row className="mb-3 align-items-center">
                <Col xs={12} md={4}>
                    <h2 className="text-capitalize mb-0">{sport}</h2>
                </Col>
                <Col xs={12} md={4} className="text-center">
                    <ButtonGroup>
                        <Button variant="outline-dark" onClick={onPrevDate}>
                            ←
                        </Button>
                        <Button variant="outline-dark" disabled>
                            {formatDate(selectedDate)}
                        </Button>
                        <Button variant="outline-dark" onClick={onNextDate}>
                            →
                        </Button>
                    </ButtonGroup>
                </Col>
                <Col xs={12} md={4}>
                    {/* Columna vacía para balance */}
                </Col>
            </Row>
            <Row className="mb-3">
                <Col xs={12}>
                    <div
                        style={{
                            backgroundColor: 'rgba(13, 110, 253, 0.1)',
                            border: '1px solid rgba(13, 110, 253, 0.3)',
                            borderRadius: '8px',
                            padding: '12px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <IoInformationCircleOutline size={20} style={{ color: '#0d6efd', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.9rem', color: '#495057' }}>
                            <strong>Arrastra para seleccionar:</strong> Haz clic y arrastra sobre los horarios disponibles para elegir el tiempo que necesitas. Los bloques en rojo están ocupados.
                        </span>
                    </div>
                </Col>
            </Row>
        </>
    );
};

export default BookingGridHeader;
