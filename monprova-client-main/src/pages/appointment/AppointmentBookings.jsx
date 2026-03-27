import React, { useState } from 'react';
import useAppointment from '../../hooks/useAppointment';
import PaymentCard from '../../components/cards/PaymentCard';
import SectionHeader from '../shared/SectionHeader';
import usePatient from '../../hooks/usePatient';
import useAuth from '../../hooks/useAuth';

const AppointmentBookings = () => {
    const [appointments] = useAppointment();
    const {user} = useAuth(); 
    const [patients] = usePatient();
    const patient = patients.find(p => p.email === user.email);

    // Filter appointments for the logged-in patient
    const patientAppointments = appointments.filter(appointment => appointment.patientID === patient?._id);
    const [filter, setFilter] = useState('all'); // Track the filter state

    // Filter appointments based on the selected filter using the paymentStatus field
    const filteredAppointments = patientAppointments.filter(appointment => {
        if (filter === 'paid') {
            return appointment.paymentStatus === 'paid';
        }
        if (filter === 'unpaid') {
            return appointment.paymentStatus === 'unpaid';
        }
        return true; // Show all appointments if 'all' filter is selected
    });

    return (
        <div className="px-6">

            <div className='pb-8'>
                <SectionHeader heading={"আপনার বুকিংসমুহ"} subHeading={"আপনার অ্যাপয়েন্টমেন্ট বুকিংস গুলো এখানে দেখুন"}></SectionHeader>
            </div>
            {/* Filter buttons */}
            <div className=" mb-6 gap-4">
                <button
                    className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all'
                        ? "bg-secondary-color text-white"
                        : "bg-white text-secondary-color border border-secondary-color"
                        } mx-4`} // Added mx-4 for a larger gap
                    onClick={() => setFilter('all')}
                >
                    সব
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-semibold ${filter === 'paid'
                        ? "bg-secondary-color text-white"
                        : "bg-white text-secondary-color border border-secondary-color"
                        } mx-4`} // Added mx-4 for a larger gap
                    onClick={() => setFilter('paid')}
                >
                    পেইড
                </button>
                <button
                    className={`px-4 py-2 rounded-lg font-semibold ${filter === 'unpaid'
                        ? "bg-secondary-color text-white"
                        : "bg-white text-secondary-color border border-secondary-color"
                        } mx-4`} // Added mx-4 for a larger gap
                    onClick={() => setFilter('unpaid')}
                >
                    আনপেইড
                </button>

            </div>

            {/* Appointment cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAppointments.map((appointment) => (
                    <PaymentCard key={appointment._id} appointment={appointment} />
                ))}
            </div>
        </div>
    );
};

export default AppointmentBookings;
