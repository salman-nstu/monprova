import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardNavBar from '../components/NavBar/DashboardNavBar';

const DoctorDashboardLayout = () => {
    return (
        <div>
            <DashboardNavBar role="doctor"></DashboardNavBar>
            <main className="ml-[20%] flex-1 p-8 bg-[#EFF7FE] overflow-y-auto h-screen">
               <Outlet></Outlet>
            </main>
        </div>
    );
};

export default DoctorDashboardLayout;