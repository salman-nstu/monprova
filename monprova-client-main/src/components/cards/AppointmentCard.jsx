import React from 'react';
import { Link } from 'react-router-dom';
import useDoctor from '../../hooks/useDoctor';
import Button from '../Button';
import Swal from 'sweetalert2'; // Ensure you import Swal properly

const AppointmentCard = ({ appointment }) => {

    const [doctors] = useDoctor();
    const doctor = doctors?.find(doctor => doctor?._id === appointment?.doctorID);

    // Handle joining the session
    const handleJoinSession = async () => {
        console.log("Appointment data:", appointment);

        // Check if session link is provided
        if (!appointment?.sessionLink) {
            console.log("Session link is missing");
            // If no session link, show a SweetAlert prompt
            await Swal.fire({
                icon: 'warning',
                title: '⚠️ সেশন লিঙ্ক প্রয়োজন!',
                text: 'ডাক্তার এখনো কোনো সেশন লিঙ্ক দেন নাই।',
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#16a34a',
            });
            return;
        }

        // If session link is available, open the session in a new tab
        console.log("Opening session link:", appointment.sessionLink);
        window.open(appointment.sessionLink, '_blank');
    };

    return (
        <div className="card bg-base-100 shadow-md border rounded-lg overflow-hidden transform transition-transform hover:shadow-lg">
            <div className="card-body p-5">
                <div className="flex gap-4 items-center">
                    <div>
                        <img src={doctor?.image || "https://i.ibb.co.com/ym2wsZXY/avater-Grey-User-Circles-Set.png"} alt="Doctor" className="w-16 h-16 object-cover rounded-full" />
                    </div>
                    <div>
                        <h2 className="card-title text-lg font-semibold">{doctor?.name}</h2>
                        <p className="text-sm text-left text-gray-600">{doctor?.designation || ""}</p>
                    </div>
                </div>
                <div className="text-start text-sm mt-3">
                    <p className="mb-2">মাধ্যমঃ <span className='bg-secondary-color text-white px-2 py-1 rounded-md text-xs'>{appointment?.mode === 'online' ? "অনলাইন" : appointment?.mode === 'offline' ? "অফলাইন" : "অনলাইন/অফলাইন"}</span></p>
                    <p className="mb-1">
                        <strong>তারিখঃ</strong>{" "}
                        {appointment.appointmentDate
                            ? new Date(appointment.appointmentDate).toLocaleDateString("en-BD", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })
                            : "Not available"}
                    </p>
                    <p className="mb-6">সময়ঃ {appointment?.slot || "অনুপস্থিত"}</p>
                    <div>
                        {
                            appointment?.mode === "online" && appointment?.state === "upcoming" && (
                                <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.tachyon&hl=en" target='_blank'>
                                    <p className='text-red-500 text-xm'>ভিডিও সেশনের জন্য Google Meet ডাউনলোড করুন</p>
                                </a>
                            )
                        }
                    </div>
                    <div className="mt-3 flex gap-4 justify-between">
                        {/* Join Session Button (Visible only for online appointments) */}
                        {appointment?.mode === 'online' && appointment?.state === "upcoming" && (
                            <div className="w-full" onClick={handleJoinSession}>
                                <Button btnName="ভিডিও সেশন এ জয়েন করুন" bgColor="bg-primary-color hover:bg-primary-400" />
                            </div>
                        )}
                        {/* View Appointment Details Button */}
                        <div className={`w-full ${appointment?.mode === "offline"|| appointment?.state === "completed" ? "mt-8" : ""}`} >
                            <Link to={`/dashboardPatient/appointmentDetailsPatient/${appointment?._id}`}>
                                <Button btnName="বিস্তারিত দেখুন" bgColor="bg-primary-color hover:bg-primary-400" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppointmentCard;
