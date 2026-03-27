import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FaUserMd, FaUsers, FaCalendarCheck, FaCheckCircle, FaClock, FaMoneyBillWave, FaExclamationCircle, FaArrowRight } from 'react-icons/fa';
import Logo from '../../components/Logo';

const AdminHome = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalDoctors: 0,
    verifiedDoctors: 0,
    pendingDoctors: 0,
    totalPatients: 0,
    completedPatients: 0,
    monthlyRevenue: 0,
    monthlyPaymentCount: 0,
    totalRevenue: 0,
    totalPaymentCount: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      const [usersRes, doctorsRes, appointmentsRes, paymentsRes] = await Promise.all([
        axiosSecure.get('/api/users'),
        axiosSecure.get('/api/doctors'),
        axiosSecure.get('/api/appointments'),
        axiosSecure.get('/api/payments')
      ]);

      const users = usersRes.data;
      const doctors = doctorsRes.data;
      const appointments = appointmentsRes.data;
      const payments = paymentsRes.data;

      // Calculate doctor statistics
      const pendingVerifications = doctors.filter(d => d.verificationStatus === 'pending').length;
      const verifiedDoctors = doctors.filter(d => d.verificationStatus === 'verified').length;
      const pendingDoctors = doctors.filter(d => d.verificationStatus === 'pending').length;

      // Calculate patient statistics
      const patients = users.filter(u => u.role === 'patient');
      const completedPatients = patients.filter(p => p.updatedAt != null).length;

      // Calculate appointment statistics
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const paidAppointments = appointments.filter(apt => apt.paymentStatus === 'paid');
      const todayAppointments = paidAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && aptDate < tomorrow;
      }).length;

      const upcomingAppointments = paidAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= today && apt.state === 'upcoming';
      }).length;

      // Calculate revenue from payments collection
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const now = new Date();
      
      // Filter for successful/paid payments only
      const successfulPayments = payments.filter(payment => 
        payment.status === 'paid' || payment.status === 'success' || payment.status === 'completed'
      );
      
      const monthlyPayments = successfulPayments.filter(payment => {
        const paymentDate = new Date(payment.paidAt || payment.date || payment.createdAt);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear &&
               paymentDate <= now;
      });
      
      const monthlyRevenue = monthlyPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
      const monthlyPaymentCount = monthlyPayments.length;

      const totalRevenue = successfulPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
      const totalPaymentCount = successfulPayments.length;

      setStats({
        pendingVerifications,
        todayAppointments,
        upcomingAppointments,
        totalDoctors: doctors.length,
        verifiedDoctors,
        pendingDoctors,
        totalPatients: patients.length,
        completedPatients,
        monthlyRevenue,
        monthlyPaymentCount,
        totalRevenue,
        totalPaymentCount
      });

      // Get recent activities (last 5 appointments)
      const recentAppts = paidAppointments
        .sort((a, b) => new Date(b.createdAt || b.appointmentDate) - new Date(a.createdAt || a.appointmentDate))
        .slice(0, 5)
        .map(apt => ({
          type: 'appointment',
          message: `${apt.patientName || 'রোগী'} এর সাথে ${apt.mode === 'online' ? 'অনলাইন' : 'অফলাইন'} অ্যাপয়েন্টমেন্ট`,
          date: apt.createdAt || apt.appointmentDate,
          state: apt.state
        }));

      setRecentActivities(recentAppts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">লোড হচ্ছে...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
         <div className='py-2 mb-2'>
                    <Logo></Logo>
                </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-lg text-gray-600">সিস্টেম ওভারভিউ ও গুরুত্বপূর্ণ পরিসংখ্যান</p>
        </div>

        {/* Pending Verification Alert */}
        {stats.pendingVerifications > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaExclamationCircle className="text-3xl text-yellow-600" />
              <div>
                <p className="font-semibold text-gray-800">মনোযোগ প্রয়োজন!</p>
                <p className="text-gray-700">{stats.pendingVerifications} টি ডাক্তার ভেরিফিকেশন অনুরোধ অপেক্ষমাণ</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboardAdmin/verification')}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              দেখুন <FaArrowRight />
            </button>
          </div>
        )}

        {/* Main Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Doctors Card */}
          <div 
            onClick={() => navigate('/dashboardAdmin/doctors')}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <FaUserMd className="text-4xl text-blue-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{stats.totalDoctors}</p>
                <p className="text-sm text-gray-600">মোট ডাক্তার</p>
              </div>
            </div>
            <div className="border-t pt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-center bg-green-50 py-2 rounded">
                <p className="font-semibold text-green-700">{stats.verifiedDoctors}</p>
                <p className="text-gray-600">ভেরিফাইড</p>
              </div>
              <div className="text-center bg-yellow-50 py-2 rounded">
                <p className="font-semibold text-yellow-700">{stats.pendingDoctors}</p>
                <p className="text-gray-600">অপেক্ষমাণ</p>
              </div>
            </div>
          </div>

          {/* Patients Card */}
          <div 
            onClick={() => navigate('/dashboardAdmin/users')}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <FaUsers className="text-4xl text-green-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{stats.totalPatients}</p>
                <p className="text-sm text-gray-600">মোট রোগী</p>
              </div>
            </div>
            <div className="border-t pt-3 text-center">
              <p className="text-lg font-semibold text-gray-800">{stats.completedPatients}</p>
              <p className="text-sm text-gray-600">সম্পূর্ণ প্রোফাইল</p>
            </div>
          </div>

          {/* Today's Appointments Card */}
          <div 
            onClick={() => navigate('/dashboardAdmin/appointmentInfo')}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <FaCalendarCheck className="text-4xl text-purple-500" />
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-800">{stats.todayAppointments}</p>
                <p className="text-sm text-gray-600">আজকের অ্যাপয়েন্টমেন্ট</p>
              </div>
            </div>
            <div className="border-t pt-3 text-center">
              <p className="text-lg font-semibold text-gray-800">{stats.upcomingAppointments}</p>
              <p className="text-sm text-gray-600">আসন্ন অ্যাপয়েন্টমেন্ট</p>
            </div>
          </div>

          {/* Revenue Card */}
          <div 
            onClick={() => navigate('/dashboardAdmin/payout')}
            className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500 cursor-pointer hover:shadow-xl hover:scale-105 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <FaMoneyBillWave className="text-4xl text-orange-500" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">৳ {formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-sm text-gray-600">মোট পেমেন্ট (এই মাস)</p>
              </div>
            </div>
            <div className="border-t pt-3 text-center">
              <p className="text-lg font-semibold text-gray-800">{stats.monthlyPaymentCount} টি</p>
              <p className="text-sm text-gray-600">পেমেন্ট সংখ্যা</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaClock className="text-blue-500" />
            সাম্প্রতিক কার্যক্রম
          </h2>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">কোনো সাম্প্রতিক কার্যক্রম নেই</p>
            ) : (
              recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      activity.state === 'completed' ? 'bg-green-100' :
                      activity.state === 'upcoming' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {activity.state === 'completed' ? (
                        <FaCheckCircle className="text-green-600" />
                      ) : (
                        <FaClock className="text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{activity.message}</p>
                      <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    activity.state === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.state === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.state === 'completed' ? 'সম্পন্ন' : 
                     activity.state === 'upcoming' ? 'আসন্ন' : 
                     activity.state}
                  </span>
                </div>
              ))
            )}
          </div>
          
          {recentActivities.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/dashboardAdmin/appointmentInfo')}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2 mx-auto"
              >
                সব অ্যাপয়েন্টমেন্ট দেখুন <FaArrowRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
