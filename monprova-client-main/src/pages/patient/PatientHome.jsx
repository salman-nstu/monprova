import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import usePatient from '../../hooks/usePatient';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useUser from '../../hooks/useUser';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaUserMd, FaFilePrescription, FaExclamationTriangle, FaArrowRight, FaCalendarPlus, FaUser, FaList, FaBrain, FaBookOpen, FaVideo, FaQuestionCircle, FaGamepad, FaBell } from 'react-icons/fa';
import useNotifications from '../../hooks/useNotifications';
import NotificationDropdown from '../../components/NotificationDropdown';
import Logo from '../../components/Logo';

const PatientHome = () => {
    const [patients] = usePatient();
    const { user } = useAuth();
    const [users] = useUser();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { unreadCount } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);
    
    const patient = patients?.find(p => p.email === user?.email);
    const userAccount = users?.find(u => u.email === user?.email);
    
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [prescriptions, setPrescriptions] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [stats, setStats] = useState({
        upcoming: 0,
        prescriptionsCount: 0
    });
    const [profileCompletion, setProfileCompletion] = useState(0);

    useEffect(() => {
        if (user?.email) {
            fetchAllData();
            calculateProfileCompletion();
        }
    }, [user?.email, patient]);

    const fetchAllData = async () => {
        try {
            const [appointmentsRes, prescriptionsRes, doctorsRes] = await Promise.all([
                axiosSecure.get('/api/appointments'),
                axiosSecure.get('/api/prescriptions'),
                axiosSecure.get('/api/doctors')
            ]);

            const allAppointments = appointmentsRes.data;
            const allPrescriptions = prescriptionsRes.data;
            setDoctors(doctorsRes.data);

            // Filter patient's appointments
            const myAppointments = allAppointments.filter(
                apt => apt.patientEmail === user?.email && apt.paymentStatus === 'paid'
            );
            setAppointments(myAppointments);

            // Filter patient's prescriptions
            const myPrescriptions = allPrescriptions.filter(
                pres => pres.patientEmail === user?.email
            );
            setPrescriptions(myPrescriptions);

            // Calculate statistics
            const upcoming = myAppointments.filter(apt => apt.state === 'upcoming').length;

            setStats({
                upcoming: upcoming,
                prescriptionsCount: myPrescriptions.length
            });

            // Find next upcoming appointment
            const upcomingAppointments = myAppointments
                .filter(apt => apt.state === 'upcoming' && apt.appointmentDate)
                .sort((a, b) => {
                    const dateA = new Date(a.appointmentDate);
                    const dateB = new Date(b.appointmentDate);
                    return dateA - dateB;
                });
            
            console.log('All my appointments:', myAppointments);
            console.log('Filtered upcoming appointments:', upcomingAppointments);
            
            if (upcomingAppointments.length > 0) {
                setNextAppointment(upcomingAppointments[0]);
                console.log('Next appointment data:', upcomingAppointments[0]);
                console.log('appointmentDate:', upcomingAppointments[0].appointmentDate);
                console.log('slot:', upcomingAppointments[0].slot);
            } else {
                console.log('No upcoming appointments found');
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
    };

    const calculateProfileCompletion = () => {
        if (!patient) {
            setProfileCompletion(0);
            return;
        }

        const fields = [
            patient.name,
            patient.age,
            patient.gender,
            patient.phone,
            patient.bloodGroup,
            patient.address,
            patient.emergencyContact,
            patient.profession,
            patient.image
        ];

        const filledFields = fields.filter(field => field && field.toString().trim() !== '').length;
        const percentage = Math.round((filledFields / fields.length) * 100);
        setProfileCompletion(percentage);
    };

    const getDoctorName = (doctorID) => {
        const doctor = doctors.find(d => d._id === doctorID);
        return doctor?.name || 'N/A';
    };

    const getDoctorSpecialty = (doctorID) => {
        const doctor = doctors.find(d => d._id === doctorID);
        return doctor?.expertise || 'N/A';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            
            // Use English locale for reliable formatting
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            return formattedDate;
        } catch (error) {
            console.error('Date formatting error:', error);
            return 'N/A';
        }
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return timeString;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">লোড হচ্ছে...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E6F0FF] p-8 relative">
            {/* Fixed Notification Button - Top Right Corner */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
                >
                    <FaBell className="text-2xl" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
                <NotificationDropdown 
                    isOpen={showNotifications} 
                    onClose={() => setShowNotifications(false)} 
                />
            </div>

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className='py-2 mb-2'>
                    <Logo></Logo>
                </div>
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        স্বাগতম, {patient?.name || userAccount?.name || 'রোগী'}!
                    </h1>
                    <p className="text-lg text-gray-600">আপনার স্বাস্থ্য ড্যাশবোর্ড</p>
                </div>

                {/* Profile Completion Alert */}
                {profileCompletion < 100 && (
                    <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FaExclamationTriangle className="text-3xl text-orange-600" />
                            <div>
                                <p className="font-semibold text-gray-800">প্রোফাইল সম্পূর্ণ করুন</p>
                                <p className="text-gray-700">আপনার প্রোফাইল {profileCompletion}% সম্পূর্ণ। সম্পূর্ণ প্রোফাইল আপনার চিকিৎসায় সহায়ক।</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboardPatient/patientProfile')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                        >
                            সম্পূর্ণ করুন <FaArrowRight />
                        </button>
                    </div>
                )}

                {/* Next Upcoming Appointment - Prominent Card */}
                {nextAppointment && (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-2xl p-6 mb-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <FaCalendarAlt className="text-3xl" />
                            <h2 className="text-2xl font-bold">আপনার পরবর্তী অ্যাপয়েন্টমেন্ট</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                            <div>
                                <p className="text-sm opacity-90">রোগীর নাম</p>
                                <p className="text-xl font-bold">{nextAppointment.patientName || patient?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">ডাক্তার</p>
                                <p className="text-xl font-bold">{getDoctorName(nextAppointment.doctorID)}</p>
                                <p className="text-xs opacity-80">{getDoctorSpecialty(nextAppointment.doctorID)}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">তারিখ ও সময়</p>
                                <p className="text-xl font-bold">
                                    {nextAppointment.appointmentDate 
                                        ? formatDate(nextAppointment.appointmentDate) 
                                        : 'তারিখ পাওয়া যায়নি'}
                                </p>
                                <p className="text-lg opacity-90">
                                    {nextAppointment.slot || 'সময় পাওয়া যায়নি'}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">মাধ্যম</p>
                                <p className="text-lg font-semibold">{nextAppointment.mode === 'online' ? 'অনলাইন' : 'অফলাইন'}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">স্থিতি</p>
                                <p className="text-lg font-semibold">{nextAppointment.state === 'upcoming' ? 'আসন্ন' : nextAppointment.state}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboardPatient/appointment')}
                            className="mt-4 bg-white text-blue-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition"
                        >
                            বিস্তারিত দেখুন
                        </button>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Book Session */}
                    <div 
                        onClick={() => navigate('/dashboardPatient/doctorList')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <FaCalendarPlus className="text-5xl text-blue-500 mb-3" />
                            <p className="text-lg font-bold text-gray-800">সেশন বুক করুন</p>
                            <p className="text-xs text-gray-600 mt-1">ডাক্তার নির্বাচন করুন</p>
                        </div>
                    </div>

                    {/* Take Assessment */}
                    <div 
                        onClick={() => navigate('/dashboardPatient/assessment')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <FaBrain className="text-5xl text-green-500 mb-3" />
                            <p className="text-lg font-bold text-gray-800">মূল্যায়ন করুন</p>
                            <p className="text-xs text-gray-600 mt-1">মানসিক স্বাস্থ্য পরীক্ষা</p>
                        </div>
                    </div>

                    {/* Prescriptions */}
                    <div 
                        onClick={() => navigate('/dashboardPatient/prescription')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <FaFilePrescription className="text-5xl text-purple-500 mb-3" />
                            <p className="text-lg font-bold text-gray-800">প্রেসক্রিপশন</p>
                            <p className="text-xs text-gray-600 mt-1">সকল প্রেসক্রিপশন দেখুন</p>
                        </div>
                    </div>

                    {/* Mental Health Resources */}
                    <div 
                        onClick={() => navigate('/dashboardPatient/resources/videos')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <FaVideo className="text-5xl text-orange-500 mb-3" />
                            <p className="text-lg font-bold text-gray-800">রিসোর্স</p>
                            <p className="text-xs text-gray-600 mt-1">ভিডিও ও ব্লগ</p>
                        </div>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaClock className="text-blue-500" />
                        সাম্প্রতিক অ্যাপয়েন্টমেন্ট
                    </h2>
                    <div className="space-y-3">
                        {appointments.length === 0 ? (
                            <p className="text-gray-500 text-center py-8">কোনো অ্যাপয়েন্টমেন্ট নেই</p>
                        ) : (
                            appointments
                                .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
                                .slice(0, 5)
                                .map((appointment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${
                                                appointment.state === 'completed' ? 'bg-green-100' :
                                                appointment.state === 'upcoming' ? 'bg-blue-100' :
                                                'bg-gray-100'
                                            }`}>
                                                <FaUserMd className={
                                                    appointment.state === 'completed' ? 'text-green-600' :
                                                    appointment.state === 'upcoming' ? 'text-blue-600' :
                                                    'text-gray-600'
                                                } />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    ডাঃ {getDoctorName(appointment.doctorID)}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(appointment.appointmentDate)} - {appointment.slot || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            appointment.state === 'completed' ? 'bg-green-100 text-green-700' :
                                            appointment.state === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                            {appointment.state === 'completed' ? 'সম্পন্ন' : 
                                             appointment.state === 'upcoming' ? 'আসন্ন' : 
                                             appointment.state}
                                        </span>
                                    </div>
                                ))
                        )}
                    </div>
                    {appointments.length > 0 && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => navigate('/dashboardPatient/appointment')}
                                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 mx-auto"
                            >
                                সব অ্যাপয়েন্টমেন্ট দেখুন <FaArrowRight />
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => navigate('/dashboardPatient/faq')}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-6 px-6 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-3"
                    >
                        <FaQuestionCircle className="text-2xl" />
                        <span>সাধারণ প্রশ্ন</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboardPatient/games')}
                        className="bg-green-500 hover:bg-green-600 text-white py-6 px-6 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-3"
                    >
                        <FaGamepad className="text-2xl" />
                        <span>গেমস</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboardPatient/resources/blogs')}
                        className="bg-orange-500 hover:bg-orange-600 text-white py-6 px-6 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-3"
                    >
                        <FaBookOpen className="text-2xl" />
                        <span>ব্লগ পড়ুন</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboardPatient/patientProfile')}
                        className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-6 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-3"
                    >
                        <FaUser className="text-2xl" />
                        <span>প্রোফাইল</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientHome;
