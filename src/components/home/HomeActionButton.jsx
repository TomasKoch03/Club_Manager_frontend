import React from 'react';
import { Button } from 'react-bootstrap';

const HomeActionButton = ({ icon, text, onClick, href }) => {
    const Icon = icon;
    const buttonContent = (
        <div className="d-flex flex-column align-items-center justify-content-center h-100 py-4">
            <Icon size={60} style={{ marginBottom: '16px', color: '#000' }} />
            <span style={{ fontSize: '1.1rem', fontWeight: '500', color: '#000' }}>
                {text}
            </span>
        </div>
    );

    if (href) {
        return (
            <Button
                variant="outline-dark"
                className="w-100 h-100"
                style={{
                    minHeight: '180px',
                    border: '2px solid #000',
                    borderRadius: '12px',
                    transition: 'all 0.2s ease',
                }}
                href={href}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#000';
                    e.currentTarget.style.color = '#fff';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) icon.style.color = '#fff';
                    const text = e.currentTarget.querySelector('span');
                    if (text) text.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#000';
                    const icon = e.currentTarget.querySelector('svg');
                    if (icon) icon.style.color = '#000';
                    const text = e.currentTarget.querySelector('span');
                    if (text) text.style.color = '#000';
                }}
            >
                {buttonContent}
            </Button>
        );
    }

    return (
        <Button
            variant="outline-dark"
            className="w-100 h-100"
            style={{
                minHeight: '180px',
                border: '2px solid #000',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
            }}
            onClick={onClick}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#000';
                e.currentTarget.style.color = '#fff';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.color = '#fff';
                const text = e.currentTarget.querySelector('span');
                if (text) text.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#000';
                const icon = e.currentTarget.querySelector('svg');
                if (icon) icon.style.color = '#000';
                const text = e.currentTarget.querySelector('span');
                if (text) text.style.color = '#000';
            }}
        >
            {buttonContent}
        </Button>
    );
};

export default HomeActionButton;