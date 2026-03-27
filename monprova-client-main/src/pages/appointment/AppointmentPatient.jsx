import React, { useState } from 'react';
import useAppointment from '../../hooks/useAppointment';
import useAuth from '../../hooks/useAuth';
import AppointmentCard from '../../components/cards/AppointmentCard';
import SectionHeader from '../shared/SectionHeader';

const AppointmentPatient = () => {
    const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming" or "completed"
    const [appointments] = useAppointment();
    const { user } = useAuth();
    
    const appointment = appointments?.filter(appointment => appointment.patientEmail === user?.email && appointment.paymentStatus === "paid");

    // Filter based on status
    const upcomingAppointment = appointment?.filter(appointment => appointment.state === "upcoming");
    const completedAppointment = appointment?.filter(appointment => appointment.state === "completed");

    // Function to sort appointments by appointmentDate (latest first), and slotTime if needed
    const sortAppointments = (appointmentsList) => {
        return appointmentsList.sort((a, b) => {
            const dateA = new Date(a.appointmentDate); // Assuming `appointmentDate` exists
            const dateB = new Date(b.appointmentDate);

            // If the appointmentDate is the same, compare slotTime
            if (dateA.getTime() === dateB.getTime()) {
                const timeA = new Date(a.slotTime); // Assuming `slotTime` exists
                const timeB = new Date(b.slotTime);
                return timeB - timeA; // Sort by slotTime, latest first
            }

            return dateA - dateB; // Sort by appointmentDate, latest first
        });
    };

    const renderAppointments = () => {
        const appointmentList = activeTab === "upcoming" ? upcomingAppointment : completedAppointment;
        
        // If no appointments exist
        if (appointmentList.length === 0) {
            return <p className="text-gray-500">কোনো অ্যাপয়েন্টমেন্ট নেই</p>;
        }

        // Sort the appointments before rendering
        const sortedAppointments = sortAppointments(appointmentList);

        // Render sorted appointments
        return sortedAppointments.map((appointment, idx) => (
            <AppointmentCard key={idx} appointment={appointment}></AppointmentCard>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className='mb-8'>
                    <SectionHeader heading={"আপনার অ্যাপয়েন্টমেন্টসমুহ"} subHeading={"আপনার অ্যাপয়েন্টমেন্ট গুলো এখানে দেখুন"}></SectionHeader>
                </div>
                
                {/* Tabs */}
                <div className="flex gap-4 mb-8 bg-white p-4 rounded-lg shadow-md">
                    <button
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === "upcoming"
                            ? "bg-blue-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                            }`}
                        onClick={() => setActiveTab("upcoming")}
                    >
                        আপকামিং
                    </button>
                    <button
                        className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${activeTab === "completed"
                            ? "bg-green-600 text-white shadow-lg scale-105"
                            : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                            }`}
                        onClick={() => setActiveTab("completed")}
                    >
                        সম্পন্ন
                    </button>
                </div>

                {/* Appointment List */}
                <div className="grid grid-cols-2 gap-6">{renderAppointments()}</div>
            </div>
        </div>
    );
};

export default AppointmentPatient;
