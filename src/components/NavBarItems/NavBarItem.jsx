import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const NavBarItem = ({
                        href,
                        onClick,
                        children,
                        ariaLabel,
                        icon: Icon
                    }) => {
    const navigate = useNavigate();
    const handleClick = (e) => {
        if (onClick) {
            if (!href) {
                e.preventDefault();
            }
            onClick();
        } else if (href) {
            navigate(href);
        }
    };

    return (
        <Button
            variant="outline-dark"
            onClick={handleClick}
            aria-label={ariaLabel}
            className="d-flex align-items-center mx-2"
            style={{
                textDecoration: 'none',
                border: 'none',
                boxShadow: 'none',
            }}
        >
            {Icon && <Icon size={20} />}
            {children && <span className={Icon ? 'ms-2' : ''}>{children}</span>}
        </Button>
    );
};

export default NavBarItem;