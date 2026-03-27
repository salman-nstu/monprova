import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import Button from '../Button';
import axios from 'axios';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import usePatient from '../../hooks/usePatient';

const MySwal = withReactContent(Swal);

const AppointmentCardDoctor = ({ appointment }) => {
    const link = appointment?.sessionLink;
    const [sessionLink, setSessionLink] = useState(link);
    const [patients] = usePatient();
    const patient = patients?.find(patient => patient?._id === appointment?.patientID)
    // 🧾 Save session link
    const axiosPublic = useAxiosPublic();

    const handleStartSession = async () => {
        // Check if session link is provided
        if (!sessionLink) {
            // If no session link, show a SweetAlert prompt asking the user to provide a link
            await MySwal.fire({
                icon: 'warning',
                title: '⚠️ সেশন লিঙ্ক প্রয়োজন!',
                text: 'দয়া করে সেশন লিঙ্ক দিন যেন আপনি সেশন শুরু করতে পারেন।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        // If session link is available, start the session by redirecting to the session link
        window.open(sessionLink, '_blank');
    };

    const handleSetSessionLink = async () => {
        // If sessionLink is not provided, show SweetAlert to ask for a link
        const { value: link } = await MySwal.fire({
            title: '🔗 সেশন লিঙ্ক দিন',
            subTitle: "Google Meet Link দিন",
            input: 'url',
            inputPlaceholder: 'যেমনঃ https://meet.google.com/abc-defg-hij',
            inputValue: sessionLink || "",
            showCancelButton: true,
            cancelButtonText: 'বাতিল',
            confirmButtonText: 'সংরক্ষণ করুন',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) {
                    return '⚠️ দয়া করে একটি লিঙ্ক দিন!';
                }
            },
        });

        // Log the link received from SweetAlert
        console.log("Received session link from SweetAlert:", link);

        if (link) {
            setSessionLink(link);  // Save link to state

            try {
                // Send PATCH request to update the session link in the backend
                const response = await axiosPublic.patch(`/api/sessionlink/${appointment._id}`, { sessionLink: link });

                // Log API response
                console.log("API response:", response);

                await MySwal.fire({
                    icon: 'success',
                    title: '✅ লিঙ্ক সংরক্ষণ হয়েছে!',
                    text: 'সেশন লিঙ্ক সফলভাবে সংরক্ষণ করা হয়েছে।',
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#16a34a',
                });
            } catch (error) {
                console.error('Error updating session link:', error);
                MySwal.fire({
                    icon: 'error',
                    title: '❌ ত্রুটি!',
                    text: 'সেশন লিঙ্ক সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।',
                });
            }
        }
    };

    // Log appointment details for debugging
    console.log("Appointment details:", appointment);

    return (
        <div className="bg-white shadow-md border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-blue-200">
            <div className="p-6">
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-1 h-6 bg-blue-500 mr-3 rounded"></span>
                        {patient?.name || 'নাম পাওয়া যায়নি'}
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">মাধ্যমঃ</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${appointment?.mode === 'online' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 'bg-green-50 text-green-600 border border-green-200'
                                }`}>
                                {appointment?.mode === 'online' ? "অনলাইন" : appointment?.mode === 'offline' ? "অফলাইন" : "অনলাইন/অফলাইন"}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">তারিখঃ</span>
                            <span className="text-gray-600">{appointment.appointmentDate
                                ? new Date(appointment.appointmentDate).toLocaleDateString("en-BD", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                })
                                : "Not available"}</span>
                        </div>
                        <div className="flex items-center">
                            <span className="font-semibold text-gray-700 w-20">সময়ঃ</span>
                            <span className="text-gray-600">{appointment?.slot || 'সময় নেই'}</span>
                        </div>
                    </div>
                </div>

                <div className={`grid gap-3 mt-4 ${appointment?.mode === 'online' ? 'grid-cols-3' : 'grid-cols-1'
                    }`}>
                    {/* ✅ Start Session Button */}
                    {appointment?.mode === 'online' && (
                        <button
                            onClick={handleStartSession}
                           
                            className="bg-green-500 text-white py-3 text-sm px-4 rounded-lg font-semibold shadow-md hover:bg-green-600 transition-all duration-200"
                        >
                            সেশন শুরু করুন
                        </button>
                    )}

                    {/* ✅ Set Session Link */}
                    {appointment?.mode === 'online' && (
                        <button
                            onClick={handleSetSessionLink}
                          
                            className="bg-purple-500 text-white py-3 text-sm px-4 rounded-lg font-semibold shadow-md hover:bg-purple-600 transition-all duration-200"
                        >
                            সেশন লিঙ্ক দিন
                        </button>
                    )}

                    {/* ✅ Details Button */}
                    <Link to={`/dashboardDoctor/appointmentDetailsDoctor/${appointment?._id}`}>
                        <button className="w-full bg-blue-500 text-white text-sm py-3 px-4 rounded-lg font-semibold shadow-md hover:bg-blue-600 transition-all duration-200">
                            বিস্তারিত দেখুন
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCardDoctor;
