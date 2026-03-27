import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import useUser from "../../hooks/useUser";
import { FaMoneyBillWave, FaCheckCircle, FaClock, FaEye } from 'react-icons/fa';

const Payout = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [usersDb] =useUser();
  const admin = usersDb.find(user => user.role === 'admin');
  const [payouts, setPayouts] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]); // For admin names
  const [payments, setPayments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [doctorPayoutHistory, setDoctorPayoutHistory] = useState([]);
  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [showMorePayouts, setShowMorePayouts] = useState(false);
  const [showMorePayments, setShowMorePayments] = useState(false);
  const [paymentStats, setPaymentStats] = useState({
    monthlyPaymentAmount: 0,
    monthlyPayoutAmount: 0,
    monthlyPaymentCount: 0,
    monthlyPayoutCount: 0
  });
  const [doctorEarnings, setDoctorEarnings] = useState({
    totalIncome: 0,
    netIncome: 0,
    totalReceived: 0,
    pending: 0,
    completedCount: 0
  });

  const [form, setForm] = useState({
    doctorId: "",
    doctorName: "",
    amount: "",
    method: "Bkash",
    accountNumber: "",
    transactionId: "",
    note: "",
  });

  useEffect(() => {
    fetchPayouts();
    fetchDoctors();
    fetchUsers();
    fetchPaymentsAndAppointments();
  }, []);

  const fetchPaymentsAndAppointments = async () => {
    try {
      const [paymentsRes, appointmentsRes, payoutsRes] = await Promise.all([
        axiosSecure.get('/api/payments'),
        axiosSecure.get('/api/appointments'),
        axiosSecure.get('/api/payouts')
      ]);
      
      const paymentsData = paymentsRes.data;
      const appointmentsData = appointmentsRes.data;
      const payoutsData = payoutsRes.data;
      
      setPayments(paymentsData);
      setAppointments(appointmentsData);
      setPayouts(payoutsData);
      
      // Calculate current month stats
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      // Filter successful payments for current month
      const successfulPayments = paymentsData.filter(p => 
        p.status === 'paid' || p.status === 'success' || p.status === 'completed'
      );
      
      const monthlyPayments = successfulPayments.filter(payment => {
        const paymentDate = new Date(payment.paidAt || payment.date || payment.createdAt);
        return paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      });
      
      // Filter payouts for current month
      const monthlyPayouts = payoutsData.filter(payout => {
        const payoutDate = new Date(payout.timestamp || payout.date || payout.createdAt);
        return payoutDate.getMonth() === currentMonth && 
               payoutDate.getFullYear() === currentYear;
      });
      
      setPaymentStats({
        monthlyPaymentAmount: monthlyPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        monthlyPayoutAmount: monthlyPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
        monthlyPaymentCount: monthlyPayments.length,
        monthlyPayoutCount: monthlyPayouts.length
      });
    } catch (error) {
      console.error('Error fetching payments and appointments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosSecure.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axiosSecure.get("/api/doctors");
      console.log("Fetched doctors:", response.data);
      console.log("First doctor sample:", response.data[0]);
      console.log("First doctor name:", response.data[0]?.name);
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "ডাক্তারদের তথ্য লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
    }
  };

  const fetchPayouts = async () => {
    try {
      const response = await axiosSecure.get("/api/payouts");
      console.log("Fetched payouts:", response.data);
      console.log("First payout sample:", response.data[0]);
      setPayouts(response.data);
    } catch (error) {
      console.error("Error fetching payouts:", error);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('en-IN').format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAppointmentForPayment = (payment) => {
    return appointments.find(apt => apt._id === payment.appointmentID);
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d._id === doctorId);
    return doctor?.name || 'Unknown';
  };

  const calculateDoctorEarnings = async (doctorId, doctorName, doctor) => {
    try {
      console.log("Calculating earnings for:", { doctorId, doctorName, doctor });
      
      // Fetch ALL appointments first to see the structure
      const allAppointmentsResponse = await axiosSecure.get(`/api/appointments`);
      const allAppointments = allAppointmentsResponse.data;
      
      console.log("Total appointments in database:", allAppointments.length);
      console.log("Sample appointment:", allAppointments[0]);
      
      // Filter by doctorID (matching the field name used in appointment creation)
      const doctorAppointments = allAppointments.filter(app => app.doctorID === doctorId);
      
      console.log("Doctor appointments found:", doctorAppointments.length);
      console.log("Doctor appointments:", doctorAppointments);
      
      // Filter paid appointments (all booked appointments, not just completed)
      const paidAppointments = doctorAppointments.filter(app => 
        app.paymentStatus === 'paid'
      );
      
      console.log("Paid appointments found:", paidAppointments.length);
      console.log("Paid appointments data:", paidAppointments);
      
      setCompletedAppointments(paidAppointments);

      // Get doctor's consultation fee
      const doctorFee = Number(doctor?.consultationFee) || 0;
      console.log("Doctor's consultation fee from profile:", doctorFee);

      // Calculate total income (before charge) - use doctor's fee × number of appointments
      const totalIncome = paidAppointments.length * doctorFee;

      console.log("Total income calculated:", totalIncome, "=", paidAppointments.length, "appointments ×", doctorFee);

      // Calculate net income (after 20% charge)
      const netIncome = totalIncome * 0.8;

      // Fetch existing payouts for this doctor
      const payoutsResponse = await axiosSecure.get(`/api/payouts?doctorId=${doctorId}`);
      const doctorPayouts = payoutsResponse.data;
      
      console.log("Previous payouts found:", doctorPayouts.length);
      
      setDoctorPayoutHistory(doctorPayouts);
      
      const totalReceived = doctorPayouts.reduce(
        (sum, payout) => sum + (Number(payout.amount) || 0),
        0
      );

      const pending = netIncome - totalReceived;

      console.log("Earnings summary:", { totalIncome, netIncome, totalReceived, pending });

      setDoctorEarnings({
        totalIncome,
        netIncome,
        totalReceived,
        pending,
        completedCount: paidAppointments.length
      });
    } catch (error) {
      console.error("Error calculating earnings:", error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    console.log("Search query:", query);
    console.log("Total doctors:", doctors.length);
    
    if (query.trim() === "") {
      setFilteredDoctors([]);
      return;
    }

    // Search by doctor ID or email only
    const filtered = doctors.filter(doctor => {
      const matchesId = doctor._id?.toLowerCase().includes(query.toLowerCase());
      const matchesEmail = doctor.email?.toLowerCase().includes(query.toLowerCase());
      
      return matchesId || matchesEmail;
    });
    
    console.log("Filtered doctors:", filtered.length);
    setFilteredDoctors(filtered);
  };

  const handleDoctorSelect = async (doctor) => {
    console.log("Selected doctor object:", doctor);
    console.log("Doctor name field:", doctor.name);
    console.log("Doctor fullName field:", doctor.fullName);
    
    setSelectedDoctor(doctor);
    setSearchQuery("");
    setFilteredDoctors([]);
    setShowPayoutForm(false);
    
    setForm({
      ...form,
      doctorId: doctor._id,
      doctorName: doctor.name || doctor.fullName || "Unknown",
      accountNumber: doctor.phone || ""
    });
    
    await calculateDoctorEarnings(doctor._id, doctor.name || doctor.fullName || "Unknown", doctor);
  };

  const handleResetDoctor = () => {
    setSelectedDoctor(null);
    setSearchQuery("");
    setFilteredDoctors([]);
    setShowPayoutForm(false);
    setCompletedAppointments([]);
    setDoctorPayoutHistory([]);
    setDoctorEarnings({
      totalIncome: 0,
      netIncome: 0,
      totalReceived: 0,
      pending: 0,
      completedCount: 0
    });
    setForm({
      doctorId: "",
      doctorName: "",
      amount: "",
      method: "Bkash",
      accountNumber: "",
      transactionId: "",
      note: "",
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate amount doesn't exceed pending
    const paymentAmount = Number(form.amount);
    if (paymentAmount <= 0) {
      return Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "পরিমাণ ০ এর চেয়ে বেশি হতে হবে",
        confirmButtonColor: "#d33"
      });
    }
    
    if (paymentAmount > doctorEarnings.pending) {
      return Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: `পেমেন্ট পরিমাণ বাকি পরিমাণ (৳${doctorEarnings.pending.toFixed(2)}) এর চেয়ে বেশি হতে পারবে না`,
        confirmButtonColor: "#d33"
      });
    }
    
    try {
      const adminInfo = JSON.parse(localStorage.getItem("loggedInUser")) || {};
      console.log("Admin info from localStorage:", adminInfo);
      console.log("Admin email:", adminInfo.email);
      
      const payoutData = {
        doctorId: form.doctorId,
        doctorName: form.doctorName,
        amount: Number(form.amount), // Net amount paid to doctor (80% of total)
        method: form.method,
        accountNumber: form.accountNumber,
        transactionId: form.transactionId,
        note: form.note,
        adminEmail: admin.email, // Store admin email
        timestamp: new Date()
      };

      console.log("Payout data being sent:", payoutData);

      const response = await axiosSecure.post("/api/payouts", payoutData);
      
      if (response.data.insertedId) {
        // Create notification for doctor about the payout
        if (selectedDoctor?.email) {
          try {
            await axiosSecure.post("/api/notifications", {
              userEmail: selectedDoctor.email,
              type: 'payout',
              message: `আপনার ৳${Number(form.amount).toFixed(2)} টাকার পেআউট প্রক্রিয়া সম্পন্ন হয়েছে। পেমেন্ট মাধ্যম: ${form.method}`,
              relatedId: response.data.insertedId,
              isRead: false,
              createdAt: new Date()
            });
            console.log("Payout notification sent to doctor:", selectedDoctor.email);
          } catch (notificationError) {
            console.error("Error creating payout notification:", notificationError);
            // Don't fail the payout if notification fails
          }
        }

        Swal.fire({
          icon: "success",
          title: "সফল!",
          text: "পেমেন্ট সফলভাবে যুক্ত হয়েছে",
          confirmButtonColor: "#007AF5"
        });

        fetchPayouts();
        
        // Recalculate earnings
        if (selectedDoctor) {
          calculateDoctorEarnings(selectedDoctor._id, selectedDoctor.fullName);
        }

        // Reset form but keep doctor selected
        setForm({
          ...form,
          amount: "",
          transactionId: "",
          note: "",
        });
        setShowPayoutForm(false);
      }
    } catch (error) {
      console.error("Error submitting payout:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "পেমেন্ট যুক্ত করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
    }
  };

  return (
    <div className="bg-[#EFF7FE] p-4 min-h-screen">
      <div className="bg-white rounded-md p-8 shadow-sm">
        <h2 className="text-xl text-gray-800 p-4 mb-8 font-bold text-center rounded-md bg-[#EFF7FE]">
          পেআউট সংক্রান্ত তথ্য
        </h2>

        {/* Stats Bar - Only show when no doctor is selected */}
        {!selectedDoctor && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <FaMoneyBillWave className="text-3xl text-green-500" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">৳ {formatCurrency(paymentStats.monthlyPaymentAmount)}</p>
                <p className="text-sm text-gray-600">এই মাসের পেমেন্ট</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <FaMoneyBillWave className="text-3xl text-blue-500" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">৳ {formatCurrency(paymentStats.monthlyPayoutAmount)}</p>
                <p className="text-sm text-gray-600">এই মাসের পেআউট</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between">
              <FaCheckCircle className="text-3xl text-purple-500" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{paymentStats.monthlyPaymentCount}</p>
                <p className="text-sm text-gray-600">এই মাসের পেমেন্ট সংখ্যা</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between">
              <FaClock className="text-3xl text-orange-500" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-800">{paymentStats.monthlyPayoutCount}</p>
                <p className="text-sm text-gray-600">এই মাসের পেআউট সংখ্যা</p>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Doctor Search Section */}
        {!selectedDoctor && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
              ডাক্তার খুঁজুন
            </h3>
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="ডাক্তার আইডি বা ইমেইল দিয়ে খুঁজুন..."
                className="w-full border-2 border-blue-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              
              {/* Search Results Dropdown */}
              {filteredDoctors.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {filteredDoctors.map((doctor) => (
                    <div
                      key={doctor._id}
                      onClick={() => handleDoctorSelect(doctor)}
                      className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-800">{doctor.name || doctor.fullName}</p>
                          <p className="text-sm text-gray-600">{doctor.expertise || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mt-1">আইডি: {doctor._id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{doctor.email}</p>
                          <p className="text-sm text-gray-600">{doctor.phone || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery && filteredDoctors.length === 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-4">
                  <p className="text-center text-gray-500">কোনো ডাক্তার পাওয়া যায়নি</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Doctor Info and Earnings Display */}
        {selectedDoctor && (
          <div className="mb-8">
            {/* Doctor Header with Reset Button */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                ডাক্তারের তথ্য
              </h3>
              <button
                onClick={handleResetDoctor}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded-md transition"
              >
                অন্য ডাক্তার নির্বাচন করুন
              </button>
            </div>

            {/* Doctor Basic Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">নাম</p>
                  <p className="text-lg font-bold text-gray-800">{selectedDoctor.name || selectedDoctor.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">বিশেষত্ব</p>
                  <p className="text-lg font-bold text-gray-800">{selectedDoctor.expertise || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ইমেইল</p>
                  <p className="text-lg font-bold text-gray-800">{selectedDoctor.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ফোন</p>
                  <p className="text-lg font-bold text-gray-800">{selectedDoctor.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ডাক্তার আইডি</p>
                  <p className="text-lg font-bold text-gray-800">{selectedDoctor._id}</p>
                </div>
              </div>
            </div>

            {/* Earnings Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white shadow-lg p-4 rounded-lg text-center border-2 border-blue-200">
                <p className="text-sm text-gray-600 mb-1">সম্পন্ন অ্যাপয়েন্টমেন্ট</p>
                <p className="text-3xl font-bold text-blue-600">{doctorEarnings.completedCount}</p>
              </div>
              <div className="bg-white shadow-lg p-4 rounded-lg text-center border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">মোট আয়</p>
                <p className="text-2xl font-bold text-purple-600">৳ {doctorEarnings.totalIncome.toFixed(2)}</p>
              </div>
              <div className="bg-white shadow-lg p-4 rounded-lg text-center border-2 border-blue-300">
                <p className="text-sm text-gray-600 mb-1">নিট আয় (৮০%)</p>
                <p className="text-2xl font-bold text-blue-700">৳ {doctorEarnings.netIncome.toFixed(2)}</p>
              </div>
              <div className="bg-white shadow-lg p-4 rounded-lg text-center border-2 border-green-200">
                <p className="text-sm text-gray-600 mb-1">প্রদান করা হয়েছে</p>
                <p className="text-2xl font-bold text-green-600">৳ {doctorEarnings.totalReceived.toFixed(2)}</p>
              </div>
              <div className="bg-white shadow-lg p-4 rounded-lg text-center border-2 border-red-200">
                <p className="text-sm text-gray-600 mb-1">বাকি আছে</p>
                <p className="text-2xl font-bold text-red-600">৳ {doctorEarnings.pending.toFixed(2)}</p>
              </div>
            </div>

            {/* Completed Appointments Table */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-gray-800 mb-3 bg-blue-100 p-3 rounded-md">
                সম্পন্ন অ্যাপয়েন্টমেন্ট ({completedAppointments.length})
              </h4>
              <div className="overflow-x-auto bg-white rounded-md shadow-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-blue-200 text-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">তারিখ</th>
                      <th className="px-4 py-2 text-left">রোগীর নাম</th>
                      <th className="px-4 py-2 text-left">অ্যাপয়েন্টমেন্ট ফি</th>
                      <th className="px-4 py-2 text-left">সিস্টেম চার্জ (২০%)</th>
                      <th className="px-4 py-2 text-left">ডাক্তারের প্রাপ্য</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-gray-600">
                          কোনো সম্পন্ন অ্যাপয়েন্টমেন্ট নেই
                        </td>
                      </tr>
                    ) : (
                      completedAppointments.map((app, index) => {
                        const fee = Number(selectedDoctor?.consultationFee) || 0;
                        const charge = fee * 0.2;
                        const doctorAmount = fee * 0.8;
                        const appointmentDate = app.createdAt || app.date || new Date().toISOString();
                        const displayDate = new Date(appointmentDate).toLocaleDateString('bn-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                        return (
                          <tr key={app._id || index} className="border-b hover:bg-blue-50">
                            <td className="px-4 py-2">{displayDate}</td>
                            <td className="px-4 py-2">{app.patientName || app.name || 'N/A'}</td>
                            <td className="px-4 py-2">৳ {fee.toFixed(2)}</td>
                            <td className="px-4 py-2 text-red-600">৳ {charge.toFixed(2)}</td>
                            <td className="px-4 py-2 text-green-600 font-semibold">৳ {doctorAmount.toFixed(2)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Previous Payouts Table */}
            <div className="mb-6">
              <h4 className="text-md font-bold text-gray-800 mb-3 bg-green-100 p-3 rounded-md">
                পূর্ববর্তী পেআউট হিস্টোরি ({doctorPayoutHistory.length})
              </h4>
              <div className="overflow-x-auto bg-white rounded-md shadow-md border">
                <table className="min-w-full text-sm">
                  <thead className="bg-green-200 text-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">তারিখ</th>
                      <th className="px-4 py-2 text-left">পরিমাণ</th>
                      <th className="px-4 py-2 text-left">মাধ্যম</th>
                      <th className="px-4 py-2 text-left">ট্রানজেকশন আইডি</th>
                      <th className="px-4 py-2 text-left">নোট</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctorPayoutHistory.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-6 text-gray-600">
                          এখনও কোনো পেআউট করা হয়নি
                        </td>
                      </tr>
                    ) : (
                      doctorPayoutHistory.map((payout, index) => (
                        <tr key={index} className="border-b hover:bg-green-50">
                          <td className="px-4 py-2">{new Date(payout.timestamp).toLocaleDateString('bn-BD')}</td>
                          <td className="px-4 py-2 font-semibold text-green-700">৳ {payout.amount}</td>
                          <td className="px-4 py-2">{payout.method}</td>
                          <td className="px-4 py-2">{payout.transactionId}</td>
                          <td className="px-4 py-2">{payout.note || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Toggle Payout Form Button */}
            {!showPayoutForm ? (
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowPayoutForm(true)}
                  className="bg-[#007AF5] hover:bg-[#0056b3] text-white font-bold px-8 py-3 rounded-md transition text-lg"
                >
                  নতুন পেআউট তৈরি করুন
                </button>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-bold text-gray-800">নতুন পেআউট ফর্ম</h4>
                  <button
                    onClick={() => setShowPayoutForm(false)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    বাতিল করুন
                  </button>
                </div>

                {/* Payout Form */}
                <form
                  onSubmit={handleSubmit}
                  className="grid md:grid-cols-2 gap-6 p-6 bg-yellow-50 rounded-lg border-2 border-yellow-300"
                >
                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      অর্থের পরিমাণ (টাকা)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="যেমন: ৫০০০"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      প্রদানের মাধ্যম নির্বাচন করুন
                    </label>
                    <select
                      name="method"
                      value={form.method}
                      onChange={handleChange}
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                    >
                      <option value="Bkash">Bkash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                      <option value="Bank">Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      একাউন্ট / নাম্বার
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={form.accountNumber}
                      onChange={handleChange}
                      placeholder="যেমন: 017XXXXXXXX"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-2 text-gray-700">
                      ট্রানজেকশন আইডি
                    </label>
                    <input
                      type="text"
                      name="transactionId"
                      value={form.transactionId}
                      onChange={handleChange}
                      placeholder="যেমন: TXN123456789"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold mb-2 text-gray-700">
                      নোট (ঐচ্ছিক)
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange}
                      placeholder="যদি কিছু উল্লেখ করতে চান"
                      className="w-full border rounded-md p-2 focus:outline-none focus:ring focus:ring-blue-200"
                      rows="2"
                    ></textarea>
                  </div>

                  <div className="md:col-span-2 text-center mt-4">
                    <button
                      type="submit"
                      className="bg-[#007AF5] hover:bg-[#ff3d2f] text-white font-semibold px-8 py-3 rounded-md transition"
                    >
                      পেমেন্ট যুক্ত করুন
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Payout History Table (Max 5, with See More) - Only show when no doctor is selected */}
        {!selectedDoctor && (
        <div className="mt-8 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 bg-[#EFF7FE] p-3 rounded-md border text-center">
            পেআউট হিস্টোরি
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left bg-white shadow-md rounded-lg">
              <thead className="bg-[#007AF5] text-white">
                <tr>
                  <th className="px-4 py-3">তারিখ</th>
                  <th className="px-4 py-3">ডাক্তারের নাম</th>
                  <th className="px-4 py-3">পরিমাণ</th>
                  <th className="px-4 py-3">ট্রানজেকশন আইডি</th>
                  <th className="px-4 py-3">অ্যাডমিন</th>
                </tr>
              </thead>
              <tbody>
                {payouts
                  .slice(0, showMorePayouts ? payouts.length : 5)
                  .map((p, i) => {
                    // Find doctor name from doctors list if not in payout
                    const doctorName = p.doctorName || doctors.find(d => d._id === p.doctorId)?.name || "Unknown";
                    // Use admin email directly from payout
                    const adminEmail = admin?.email || "Unknown";
                    
                    return (
                      <tr 
                        key={p._id || i} 
                        className="border-b hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (p._id) {
                            navigate(`/dashboardAdmin/payout/${p._id}`);
                          } else {
                            console.error("Payout _id is missing:", p);
                            Swal.fire({
                              icon: "error",
                              title: "ত্রুটি!",
                              text: "পেআউট আইডি পাওয়া যায়নি",
                              confirmButtonColor: "#d33"
                            });
                          }
                        }}
                      >
                        <td className="px-4 py-3">{new Date(p.timestamp).toLocaleDateString('bn-BD')}</td>
                        <td className="px-4 py-3">{doctorName}</td>
                        <td className="px-4 py-3 font-semibold text-green-600">৳ {Number(p.amount).toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-sm">{p.transactionId}</td>
                        <td className="px-4 py-3 text-sm">{adminEmail}</td>
                      </tr>
                    );
                  })}
                {payouts.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center text-gray-500 py-6"
                    >
                      এখনও কোনো পেআউট রেকর্ড নেই
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {payouts.length > 5 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowMorePayouts(!showMorePayouts)}
                className="bg-[#007AF5] hover:bg-[#0066cc] text-white font-semibold px-6 py-2 rounded-md transition"
              >
                {showMorePayouts ? 'কম দেখুন' : `আরো দেখুন (${payouts.length - 5} টি)`}
              </button>
            </div>
          )}
        </div>
        )}

        {/* Payment History Log (Max 5, with See More) - Only show when no doctor is selected */}
        {!selectedDoctor && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 bg-[#EFF7FE] p-3 rounded-md border text-center">
            পেমেন্ট হিস্টোরি
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 shadow-md rounded-lg">
              <thead className="bg-[#007AF5] text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    তারিখ ও সময়
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    ডাক্তার
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    পরিমাণ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    স্ট্যাটাস
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments
                  .filter(p => p.status === 'paid' || p.status === 'success' || p.status === 'completed')
                  .sort((a, b) => {
                    const dateA = new Date(a.paidAt || a.date || a.createdAt);
                    const dateB = new Date(b.paidAt || b.date || b.createdAt);
                    return dateB - dateA; // Most recent first
                  })
                  .slice(0, showMorePayments ? payments.filter(p => p.status === 'paid' || p.status === 'success' || p.status === 'completed').length : 5)
                  .map((payment, index) => {
                    const appointment = getAppointmentForPayment(payment);
                    return (
                      <tr key={payment._id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(payment.paidAt || payment.date || payment.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getDoctorName(payment.doctorID)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                          ৳ {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {payment.status === 'paid' ? 'পরিশোধিত' : 
                             payment.status === 'success' ? 'সফল' : 'সম্পন্ন'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {appointment ? (
                            <button
                              onClick={() => navigate(`/dashboardAdmin/appointments/${appointment._id}`)}
                              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition"
                              title="অ্যাপয়েন্টমেন্ট দেখুন"
                            >
                              <FaEye />
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                {payments.filter(p => p.status === 'paid' || p.status === 'success' || p.status === 'completed').length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      কোনো পেমেন্ট হিস্টোরি পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {payments.filter(p => p.status === 'paid' || p.status === 'success' || p.status === 'completed').length > 5 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowMorePayments(!showMorePayments)}
                className="bg-[#007AF5] hover:bg-[#0066cc] text-white font-semibold px-6 py-2 rounded-md transition"
              >
                {showMorePayments ? 'কম দেখুন' : `আরো দেখুন (${payments.filter(p => p.status === 'paid' || p.status === 'success' || p.status === 'completed').length - 5} টি)`}
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default Payout;
