import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavBar from '../components/NavBar/DashboardNavBar';

const PatientDashboardLayout = () => {
    return (
        <div>
            <DashboardNavBar role="patient"></DashboardNavBar>
            <main className="ml-[20%] flex-1 p-8 overflow-y-auto h-screen">
               <Outlet></Outlet>
            </main>
        </div>
    );
};

export default PatientDashboardLayout;