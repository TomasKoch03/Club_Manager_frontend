import { Row, Col, Button, ButtonGroup } from 'react-bootstrap';

const BookingGridHeader = ({ sport, selectedDate, formatDate, onPrevDate, onNextDate }) => {
    return (
        <Row className="mb-4 align-items-center">
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
    );
};

export default BookingGridHeader;
