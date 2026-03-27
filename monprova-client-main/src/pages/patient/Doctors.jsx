import React from 'react';
import { Outlet } from 'react-router-dom';

const Doctors = () => {
    return (
        <div>
            <Outlet></Outlet>
        </div>
    );
};

export default Doctors;