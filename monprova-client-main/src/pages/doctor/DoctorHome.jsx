import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useDoctor from '../../hooks/useDoctor';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FaCalendarAlt, FaUserInjured, FaFilePrescription, FaMoneyBillWave, FaClock, FaCheckCircle, FaExclamationTriangle, FaArrowRight, FaCalendarCheck, FaUsers, FaChartLine, FaUserCog, FaVideo, FaMapMarkerAlt, FaQuestionCircle, FaBell } from 'react-icons/fa';
import useNotifications from '../../hooks/useNotifications';
import NotificationDropdown from '../../components/NotificationDropdown';
import Logo from '../../components/Logo';

const DoctorHome = () => {
    const [doctors] = useDoctor();
    const { user } = useAuth();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { unreadCount } = useNotifications();
    const [showNotifications, setShowNotifications] = useState(false);

    const doctor = doctors?.find(d => d.email === user?.email);

    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [showFAQ, setShowFAQ] = useState(false);
    const [stats, setStats] = useState({
        todayTotal: 0,
        todayCompleted: 0,
        todayUpcoming: 0,
        monthlyIncome: 0,
        totalPatients: 0,
        pendingPrescriptions: 0,
        completedSessions: 0,
        upcomingCount: 0
    });

   




    useEffect(() => {
        if (user?.email && doctor?._id) {
            fetchAllData();
        }
    }, [user?.email, doctor?._id]);

  


    const fetchAllData = async () => {
        try {
            const [appointmentsRes, prescriptionsRes] = await Promise.all([
                axiosSecure.get('/api/appointments'),
                axiosSecure.get('/api/prescriptions')
            ]);

            const allAppointments = appointmentsRes.data;
            const allPrescriptions = prescriptionsRes.data;

            // Filter doctor's appointments
            const myAppointments = allAppointments.filter(
                apt => apt.doctorID === doctor._id && apt.paymentStatus === 'paid'
            );

            console.log('All my appointments:', myAppointments.length);
            console.log('Appointment states:', myAppointments.map(apt => apt.state));
            console.log('Sample appointment:', myAppointments[0]);
            console.log('Appointment date fields:', myAppointments.map(apt => ({
                id: apt._id,
                appointmentDate: apt.appointmentDate,
                date: apt.date,
                hasAppointmentDate: !!apt.appointmentDate,
                hasDate: !!apt.date
            })));

            setAppointments(myAppointments);

            // Get today's date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];
            console.log('Today date:', today);

            // Filter today's appointments using appointmentDate field
            const todayApts = myAppointments.filter(apt => {
                // Use appointmentDate (the booked date), not createdAt
                if (!apt.appointmentDate) {
                    console.log('Appointment missing appointmentDate:', apt._id);
                    return false;
                }
                
                // Direct string comparison since appointmentDate is in YYYY-MM-DD format
                const isToday = apt.appointmentDate === today;
                console.log('Appointment:', apt._id, 'Date:', apt.appointmentDate, 'Is Today:', isToday);
                return isToday;
            });
            console.log('Today appointments count:', todayApts.length);
            console.log('Today appointments:', todayApts);
            setTodayAppointments(todayApts);

            // Calculate today's completed and upcoming
            const todayCompleted = todayApts.filter(apt => apt.state === 'completed' || apt.state === 'Completed').length;
            const todayUpcoming = todayApts.filter(apt => apt.state === 'upcoming').length;

            // Find next upcoming appointment
            const upcomingAppointments = myAppointments
                .filter(apt => apt.state === 'upcoming' && apt.appointmentDate && apt.appointmentTime)
                .sort((a, b) => {
                    try {
                        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`);
                        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`);
                        if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
                        return dateA - dateB;
                    } catch (error) {
                        return 0;
                    }
                });

            if (upcomingAppointments.length > 0) {
                setNextAppointment(upcomingAppointments[0]);
            }

            // Calculate statistics
            const completedAppointments = myAppointments.filter(apt =>
                apt.state === 'completed' || apt.state === 'Completed'
            );
            const completed = completedAppointments.length;
            const upcoming = myAppointments.filter(apt => apt.state === 'upcoming').length;

            console.log('Completed appointments count:', completed);
            console.log('Completed appointments:', completedAppointments);

            // Get unique patients
            const uniquePatients = new Set(myAppointments.map(apt => apt.patientEmail));

            // Get pending prescriptions (completed appointments without prescription)
            const completedAppointmentIds = completedAppointments.map(apt => apt._id);
            const prescribedAppointmentIds = allPrescriptions
                .filter(pres => completedAppointmentIds.includes(pres.appointmentId))
                .map(pres => pres.appointmentId);
            const pendingPrescriptions = completedAppointmentIds.filter(
                id => !prescribedAppointmentIds.includes(id)
            ).length;

            // Calculate monthly income from payments
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            // Fetch payments for this doctor
            const paymentsRes = await axiosSecure.get('/api/payments');
            const allPayments = paymentsRes.data;

            console.log('Total payments in database:', allPayments.length);
            console.log('Doctor ID:', doctor._id);

            // Filter successful payments for this doctor
            const myPayments = allPayments.filter(payment => {
                const isMyDoctor = payment.doctorID === doctor._id;
                const isSuccessful = payment.status === 'paid' || payment.status === 'success' || payment.status === 'completed';
                console.log('Payment:', payment._id, 'doctorID:', payment.doctorID, 'myID:', doctor._id, 'match:', isMyDoctor, 'status:', payment.status, 'successful:', isSuccessful);
                return isMyDoctor && isSuccessful;
            });

            console.log('My total payments:', myPayments.length);
            console.log('My payments details:', myPayments);

            const monthlyPayments = myPayments.filter(payment => {
                try {
                    const paymentDate = new Date(payment.paidAt || payment.date || payment.createdAt);
                    if (isNaN(paymentDate.getTime())) {
                        console.log('Invalid date for payment:', payment._id);
                        return false;
                    }
                    const isCurrentMonth = paymentDate.getMonth() === currentMonth &&
                        paymentDate.getFullYear() === currentYear;
                    console.log('Payment date:', paymentDate, 'Current month:', currentMonth, 'Match:', isCurrentMonth);
                    return isCurrentMonth;
                } catch (error) {
                    console.error('Invalid payment date:', payment, error);
                    return false;
                }
            });

            console.log('Monthly payments count:', monthlyPayments.length);
            console.log('Monthly payments:', monthlyPayments);

            // Calculate 80% of payment amounts (doctor's share)
            const monthlyIncome = monthlyPayments.reduce((sum, payment) => {
                const amount = Number(payment.amount) || 0;
                const doctorShare = amount * 0.8; // 80% to doctor
                console.log(`Payment ID: ${payment._id}, Amount: ${amount}, Doctor share (80%): ${doctorShare}`);
                return sum + doctorShare;
            }, 0);

            console.log('Total monthly income (80% of payments):', monthlyIncome);
            console.log('Total formatted:', formatCurrency(monthlyIncome));
            console.log('Today completed:', todayCompleted);
            console.log('Today upcoming:', todayUpcoming);
            console.log('Today total:', todayApts.length);

            setStats({
                todayTotal: todayApts.length,
                todayCompleted: todayCompleted,
                todayUpcoming: todayUpcoming,
                monthlyIncome: monthlyIncome,
                totalPatients: uniquePatients.size,
                pendingPrescriptions: pendingPrescriptions,
                completedSessions: completed,
                upcomingCount: upcoming
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setLoading(false);
        }
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

    const formatCurrency = (amount) => {
        if (!amount) return '0';
        return new Intl.NumberFormat('en-IN').format(Math.round(amount));
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'N/A';
        return timeString;
    };

    const isAppointmentSoon = (appointment) => {
        if (!appointment) return false;
        const now = new Date();
        const aptDateTime = new Date(`${appointment.date}T${appointment.time}`);
        const diffMinutes = (aptDateTime - now) / (1000 * 60);
        return diffMinutes > 0 && diffMinutes <= 30;
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
                     <div className='py-2 mb-2'>
                    <Logo></Logo>
                </div>
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        স্বাগতম,  {doctor?.name || 'ডাক্তার'}!
                    </h1>
                    <p className="text-lg text-gray-600">আপনার পেশাদার ড্যাশবোর্ড</p>
                </div>

                {/* Appointment Starting Soon Alert */}
                {nextAppointment && isAppointmentSoon(nextAppointment) && (
                    <div className="bg-orange-50 border-2 border-orange-400 rounded-lg p-4 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FaExclamationTriangle className="text-3xl text-orange-600" />
                            <div>
                                <p className="font-semibold text-gray-800">অ্যাপয়েন্টমেন্ট শীঘ্রই শুরু হবে!</p>
                                <p className="text-gray-700">
                                    {nextAppointment.patientName} - {formatTime(nextAppointment.time)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboardDoctor/appointment')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
                        >
                            দেখুন <FaArrowRight />
                        </button>
                    </div>
                )}

                {/* Next Appointment Card */}
                {nextAppointment && (
                    <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg shadow-2xl p-6 mb-8 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <FaCalendarAlt className="text-3xl" />
                            <h2 className="text-2xl font-bold">পরবর্তী অ্যাপয়েন্টমেন্ট</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
                            <div>
                                <p className="text-sm opacity-90">রোগীর নাম</p>
                                <p className="text-xl font-bold">{nextAppointment.patientName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">তারিখ ও সময়</p>
                                <p className="text-xl font-bold">{formatDate(nextAppointment.appointmentDate)}</p>
                                <p className="text-lg opacity-90">{formatTime(nextAppointment.appointmentTime)}</p>
                            </div>
                            <div>
                                <p className="text-sm opacity-90">মাধ্যম</p>
                                <p className="text-lg font-semibold flex items-center gap-2">
                                    {nextAppointment.mode === 'online' ? (
                                        <><FaVideo /> অনলাইন</>
                                    ) : (
                                        <><FaMapMarkerAlt /> অফলাইন</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboardDoctor/appointment')}
                            className="mt-4 bg-white text-teal-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-semibold transition"
                        >
                            বিস্তারিত দেখুন
                        </button>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Today's Total Appointments */}
                    <div
                        onClick={() => navigate('/dashboardDoctor/appointment')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <FaCalendarAlt className="text-4xl text-blue-500" />
                            <div className="text-right">
                                <p className="text-3xl font-bold text-gray-800">{stats.todayTotal}</p>
                                <p className="text-sm text-gray-600">আজকের মোট অ্যাপয়েন্টমেন্ট</p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Completed */}
                    <div
                        onClick={() => navigate('/dashboardDoctor/appointment')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <FaCheckCircle className="text-4xl text-green-500" />
                            <div className="text-right">
                                <p className="text-3xl font-bold text-gray-800">{stats.todayCompleted}</p>
                                <p className="text-sm text-gray-600">আজকের সম্পন্ন</p>
                            </div>
                        </div>
                    </div>

                    {/* Today's Upcoming */}
                    <div
                        onClick={() => navigate('/dashboardDoctor/appointment')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <FaClock className="text-4xl text-orange-500" />
                            <div className="text-right">
                                <p className="text-3xl font-bold text-gray-800">{stats.todayUpcoming}</p>
                                <p className="text-sm text-gray-600">আজকের আসন্ন</p>
                            </div>
                        </div>
                    </div>

                    {/* Monthly Income */}
                    <div
                        onClick={() => navigate('/dashboardDoctor/income')}
                        className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <FaMoneyBillWave className="text-4xl text-purple-500" />
                            <div className="text-right">
                                <p className="text-3xl font-bold text-gray-800">৳ {formatCurrency(stats.monthlyIncome)}</p>
                                <p className="text-sm text-gray-600">এই মাসের আয়</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FaClock className="text-teal-500" />
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
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                                        onClick={() => navigate(`/dashboardDoctor/appointmentDetailsDoctor/${appointment._id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-full ${appointment.state === 'completed' ? 'bg-green-100' :
                                                appointment.state === 'upcoming' ? 'bg-blue-100' :
                                                    'bg-gray-100'
                                                }`}>
                                                <FaUserInjured className={
                                                    appointment.state === 'completed' ? 'text-green-600' :
                                                        appointment.state === 'upcoming' ? 'text-blue-600' :
                                                            'text-gray-600'
                                                } />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">
                                                    {appointment.patientName || 'N/A'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(appointment.appointmentDate)} - {appointment.slot || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${appointment.state === 'completed' ? 'bg-green-100 text-green-700' :
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
                                onClick={() => navigate('/dashboardDoctor/appointment')}
                                className="text-teal-600 hover:text-teal-800 font-semibold flex items-center gap-2 mx-auto"
                            >
                                সব অ্যাপয়েন্টমেন্ট দেখুন <FaArrowRight />
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <button
                        onClick={() => navigate('/dashboardDoctor/schedule')}
                        className="bg-teal-500 hover:bg-teal-600 text-white py-6 px-6 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-3"
                    >
                        <FaCalendarCheck className="text-2xl" />
                        <span>সময়সূচী দেখুন</span>
                    </button>
                    <button
                        onClick={() => navigate('/dashboardDoctor/doctorProfile')}
                        className="bg-green-500 hover:bg-green-600 text-white py-6 px-6 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-3"
                    >
                        <FaUserCog className="text-2xl" />
                        <span>প্রোফাইল সেটিংস</span>
                    </button>
                    <button
                        onClick={() => setShowFAQ(!showFAQ)}
                        className="bg-blue-500 hover:bg-blue-600 text-white py-6 px-6 rounded-lg font-semibold transition shadow-lg flex items-center justify-center gap-3"
                    >
                        <FaQuestionCircle className="text-2xl" />
                        <span>সাধারণ জিজ্ঞাসা (FAQ)</span>
                    </button>
                </div>

                {/* FAQ Section */}
                {showFAQ && (
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <FaQuestionCircle className="text-blue-500" />
                                সাধারণ জিজ্ঞাসা (FAQ)
                            </h2>
                            <button
                                onClick={() => setShowFAQ(false)}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="border-l-4 border-teal-500 bg-teal-50 p-4 rounded">
                                <h3 className="font-bold text-gray-800 mb-2">কিভাবে অ্যাপয়েন্টমেন্ট সম্পন্ন করবো?</h3>
                                <p className="text-gray-700">অ্যাপয়েন্টমেন্ট তালিকা থেকে রোগীর অ্যাপয়েন্টমেন্ট নির্বাচন করুন এবং সেশন সম্পন্ন করার পর স্ট্যাটাস "সম্পন্ন" তে পরিবর্তন করুন। তারপর প্রেসক্রিপশন তৈরি করতে পারবেন।</p>
                            </div>

                            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
                                <h3 className="font-bold text-gray-800 mb-2">প্রেসক্রিপশন কিভাবে তৈরি করবো?</h3>
                                <p className="text-gray-700">সম্পন্ন অ্যাপয়েন্টমেন্টের বিস্তারিত পাতায় "প্রেসক্রিপশন তৈরি করুন" বাটনে ক্লিক করুন। ওষুধের নাম, ডোজ, সময়কাল এবং পরামর্শ লিখে সংরক্ষণ করুন।</p>
                            </div>

                            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
                                <h3 className="font-bold text-gray-800 mb-2">আমার আয় কখন পাবো?</h3>
                                <p className="text-gray-700">প্রতিটি সম্পন্ন অ্যাপয়েন্টমেন্টের ৮০% ফি আপনার আয় হিসেবে গণনা করা হয়। অ্যাডমিন নিয়মিত পেমেন্ট প্রসেস করে থাকেন। আয়ের বিস্তারিত দেখতে "আয় দেখুন" পাতায় যান।</p>
                            </div>

                            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
                                <h3 className="font-bold text-gray-800 mb-2">সময়সূচী কিভাবে সেট করবো?</h3>
                                <p className="text-gray-700">"সময়সূচী দেখুন" পাতায় গিয়ে সপ্তাহের প্রতিটি দিনের জন্য আপনার উপলব্ধ সময় নির্ধারণ করুন। রোগীরা শুধুমাত্র আপনার সেট করা সময়ে অ্যাপয়েন্টমেন্ট বুক করতে পারবেন।</p>
                            </div>

                            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
                                <h3 className="font-bold text-gray-800 mb-2">প্রোফাইল আপডেট করার গুরুত্ব কি?</h3>
                                <p className="text-gray-700">সম্পূর্ণ প্রোফাইল রোগীদের আস্থা বাড়ায়। আপনার ডিগ্রি, অভিজ্ঞতা, বিশেষত্ব এবং ছবি আপডেট করুন। ভেরিফাইড ডাক্তার হিসেবে বেশি রোগী পাবেন।</p>
                            </div>

                            <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded">
                                <h3 className="font-bold text-gray-800 mb-2">অনলাইন সেশন কিভাবে পরিচালনা করবো?</h3>
                                <p className="text-gray-700">অনলাইন মোডের অ্যাপয়েন্টমেন্টে আপনার নির্ধারিত ভিডিও কল প্ল্যাটফর্ম (জুম/গুগল মিট) লিংক শেয়ার করুন। সময়মতো সেশনে যোগ দিন এবং রোগীর সমস্যা শুনে পরামর্শ দিন।</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        
        </div>
    );
};

export default DoctorHome;
