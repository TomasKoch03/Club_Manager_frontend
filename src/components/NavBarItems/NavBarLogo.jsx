import React from 'react';
import { LuFlagTriangleRight } from "react-icons/lu";

const NavBarLogo = ({ title = "Club Manager" }) => {
    return (
        <div className="d-flex align-items-center">
            <LuFlagTriangleRight size={24} style={{ marginRight: '8px', color: '#000' }} />
            <span
                className="fw-bold fs-4"
                style={{ color: '#000' }}
            >
        {title}
      </span>
        </div>
    );
};

export default NavBarLogo;