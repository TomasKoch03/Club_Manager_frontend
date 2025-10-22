import React from 'react';
import { Link } from 'react-router-dom';
import { Form } from 'react-bootstrap';

const AuthLink = ({ text, linkText, to, controlId }) => {
    return (
        <Form.Group className="text-center mb-3" controlId={controlId}>
            <p>
                {text} <Link to={to}>{linkText}</Link>
            </p>
        </Form.Group>
    );
};

export default AuthLink;