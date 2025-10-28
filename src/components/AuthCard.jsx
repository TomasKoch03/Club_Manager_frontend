import React from 'react';
import { Container, Card } from 'react-bootstrap';

const AuthCard = ({
    children,
    width = 'min(80vw, 600px)',
    height = 'min(80vw, 500px)',
    className = ""
}) => {
    return (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
            <Container fluid className="p-0 flex items-center justify-center">
                <Card
                    style={{
                        width: width,
                        height: height,
                        backgroundColor: 'rgba(255,255,255,1)',
                        border: 'none',
                        borderRadius: '1rem',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                    }}
                    className={`d-flex align-items-center justify-content-center text-center ${className}`}
                >
                    <div className='justify-items-start items-start' style={{ padding: '1.5rem', width: '100%' }}>
                        {children}
                    </div>
                </Card>
            </Container>
        </div>
    );
};

export default AuthCard;