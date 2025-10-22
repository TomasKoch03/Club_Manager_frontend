import React from 'react';
import { Form, Button } from 'react-bootstrap';

const AuthForm = ({
    title,
    onSubmit,
    children,
    submitText = "Enviar",
    submitVariant = "dark"
}) => {
    return (
        <>
            <h2 className="mb-3">{title}</h2>
            <Form className='w-100 h-100' onSubmit={onSubmit}>
                {children}
                <Button className='m-4 px-5' variant={submitVariant} type="submit">
                    {submitText}
                </Button>
            </Form>
        </>
    );
};

export default AuthForm;