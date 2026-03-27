import React, { useState } from 'react';
import useAppointment from '../../hooks/useAppointment';
import useAuth from '../../hooks/useAuth';
import AppointmentCardDoctor from '../../components/cards/AppointmentCardDoctor';
import useDoctor from '../../hooks/useDoctor';
import SectionHeader from '../shared/SectionHeader';

const AppointmentDoctor = () => {
    const [activeTab, setActiveTab] = useState("upcoming"); // "upcoming", "completed", "upcomingOnline", "upcomingOffline", "completedOnline", "completedOffline"
    const [appointments] = useAppointment();
    const { user } = useAuth();
    const [doctors] = useDoctor();
    const doctor = doctors?.find(doctor => doctor.email === user?.email);
    const appointment = appointments?.filter(appointment => appointment.doctorID === doctor?._id && appointment.paymentStatus === "paid");

    // Search state
    const [searchQuery, setSearchQuery] = useState("");

    // Convert appointmentDate to a Month Name (for searching by month)
    const getMonthName = (dateString) => {
        const date = new Date(dateString);
        const options = { month: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    // Filter appointments based on search query (including month name)
    const filteredAppointments = appointment?.filter(appointment => {
        const searchLower = searchQuery.toLowerCase();
        const monthName = getMonthName(appointment.appointmentDate).toLowerCase();
        return (
            appointment.patientName.toLowerCase().includes(searchLower) ||
            appointment.appointmentDate.toLowerCase().includes(searchLower) ||
            monthName.includes(searchLower) // Added month search functionality
        );
    });

    // Filter based on state and mode
    const upcomingAppointment = filteredAppointments?.filter(appointment => appointment.state === "upcoming");
    const upcomingOnlineAppointment = upcomingAppointment?.filter(appointment => appointment.mode === "online");
    const upcomingOfflineAppointment = upcomingAppointment?.filter(appointment => appointment.mode === "offline");
    const completedAppointment = filteredAppointments?.filter(appointment => appointment.state === "completed");
    const completedOnlineAppointment = completedAppointment?.filter(appointment => appointment.mode === "online");
    const completedOfflineAppointment = completedAppointment?.filter(appointment => appointment.mode === "offline");

    const renderAppointments = () => {
        let appointmentList = [];
        
        // Determine which appointments to display based on active tab
        if (activeTab === "upcoming") {
            appointmentList = upcomingAppointment;
        } else if (activeTab === "completed") {
            appointmentList = completedAppointment;
        } else if (activeTab === "upcomingOnline") {
            appointmentList = upcomingOnlineAppointment;
        } else if (activeTab === "upcomingOffline") {
            appointmentList = upcomingOfflineAppointment;
        } else if (activeTab === "completedOnline") {
            appointmentList = completedOnlineAppointment;
        } else if (activeTab === "completedOffline") {
            appointmentList = completedOfflineAppointment;
        }

        // Check if appointmentList is empty
        if (!appointmentList || appointmentList.length === 0) {
            return (
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <p className="text-gray-500 text-lg">কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                </div>
            );
        }

        // Sort appointments by appointmentDate (latest first), then by slotTime (latest first)
        appointmentList = appointmentList.sort((a, b) => {
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

        // Map through the sorted appointments and render AppointmentCardDoctor components
        return appointmentList.map((appointment, idx) => (
            <AppointmentCardDoctor key={appointment?._id || idx} appointment={appointment}></AppointmentCardDoctor>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className='pb-8'>
                    <SectionHeader heading={"আপনার অ্যাপয়েন্টমেন্টসমুহ"} subHeading={"আপনার অ্যাপয়েন্টমেন্ট গুলো এখানে দেখুন"}></SectionHeader>
                </div>
                
                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="রোগীর নাম বা অ্যাপয়েন্টমেন্ট তারিখ অনুসন্ধান করুন"
                        className="w-full px-4 py-3 rounded-lg shadow-md border border-gray-300 focus:outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                
                {/* Tabs for filtering appointments */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                    <div className="flex gap-2 justify-between">
                        {/* Upcoming Button */}
                        <button
                            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "upcoming" ? "bg-blue-500 text-white shadow-md" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}
                            onClick={() => setActiveTab("upcoming")}
                        >
                            আপকামিং
                        </button>

                        {/* Upcoming Online Button */}
                        <button
                            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "upcomingOnline" ? "bg-purple-500 text-white shadow-md" : "bg-purple-50 text-purple-700 hover:bg-purple-100"}`}
                            onClick={() => setActiveTab("upcomingOnline")}
                        >
                            আপকামিং (অনলাইন)
                        </button>

                        {/* Upcoming Offline Button */}
                        <button
                            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "upcomingOffline" ? "bg-indigo-500 text-white shadow-md" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"}`}
                            onClick={() => setActiveTab("upcomingOffline")}
                        >
                            আপকামিং (অফলাইন)
                        </button>

                        {/* Completed Button */}
                        <button
                            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === "completed" ? "bg-secondary-color text-white" : "bg-white text-secondary-color border border-secondary-color"}`}
                            onClick={() => setActiveTab("completed")}
                        >
                            সম্পন্ন
                        </button>

                        {/* Completed Online Button */}
                        <button
                            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "completedOnline" ? "bg-teal-500 text-white shadow-md" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}
                            onClick={() => setActiveTab("completedOnline")}
                        >
                            সম্পন্ন (অনলাইন)
                        </button>

                        {/* Completed Offline Button */}
                        <button
                            className={`px-4 py-3 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${activeTab === "completedOffline" ? "bg-cyan-500 text-white shadow-md" : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"}`}
                            onClick={() => setActiveTab("completedOffline")}
                        >
                            সম্পন্ন (অফলাইন)
                        </button>
                    </div>
                </div>

                {/* Appointment List */}
                <div className="grid grid-cols-2 gap-6">{renderAppointments()}</div>
            </div>
        </div>
    );
};

export default AppointmentDoctor;
