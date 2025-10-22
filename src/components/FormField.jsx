import React from 'react';
import { Form } from 'react-bootstrap';

const FormField = ({
    label,
    type = "text",
    placeholder,
    value,
    onChange,
    controlId,
    className = "text-start mb-3"
}) => {
    return (
        <Form.Group className={className} controlId={controlId}>
            <Form.Label>{label}</Form.Label>
            <Form.Control
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </Form.Group>
    );
};

export default FormField;