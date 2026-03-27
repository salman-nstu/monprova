import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { FaEye, FaSearch } from "react-icons/fa";

const AppointmentInfo = () => {
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    filterAndSortAppointments();
  }, [searchQuery, stateFilter, modeFilter, sortBy, appointments]);

  const fetchAllData = async () => {
    try {
      const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
        axiosSecure.get("/api/appointments"),
        axiosSecure.get("/api/doctors"),
        axiosSecure.get("/api/users")
      ]);
      
      setAppointments(appointmentsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setFilteredAppointments(appointmentsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "ডেটা লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
      setLoading(false);
    }
  };

  // Get doctor name by ID
  const getDoctorName = (doctorID) => {
    const doctor = doctors.find(d => d._id === doctorID);
    return doctor?.name || "N/A";
  };

  // Get patient name by ID
  const getPatientName = (patientID) => {
    const patient = patients.find(p => p._id === patientID);
    return patient?.name || "N/A";
  };

  const filterAndSortAppointments = () => {
    let filtered = [...appointments];

    // Filter by state (upcoming/completed/etc)
    if (stateFilter !== "all") {
      if (stateFilter === "upcoming") {
        filtered = filtered.filter(apt => apt.state === "upcoming");
      } else if (stateFilter === "completed") {
        filtered = filtered.filter(apt => apt.state === "completed");
      } else if (stateFilter === "cancelled") {
        filtered = filtered.filter(apt => apt.state === "cancelled");
      }
    }

    // Filter by mode (online/offline)
    if (modeFilter !== "all") {
      filtered = filtered.filter(apt => apt.mode === modeFilter);
    }

    // Filter by search query (doctor name, patient name, or email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(apt => {
        const doctorName = getDoctorName(apt.doctorID)?.toLowerCase() || "";
        const patientName = getPatientName(apt.patientID)?.toLowerCase() || "";
        const patientEmail = apt.patientEmail?.toLowerCase() || "";
        
        return doctorName.includes(query) || 
               patientName.includes(query) || 
               patientEmail.includes(query);
      });
    }

    // Sort appointments - default by creation time (recent first)
    filtered = [...filtered].sort((a, b) => {
      let compareValue = 0;

      switch(sortBy) {
        case "appointmentDate":
          compareValue = new Date(a.appointmentDate || 0) - new Date(b.appointmentDate || 0);
          break;
        case "createdAt":
          // Sort by creation time in descending order (recent first)
          compareValue = new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          break;
        case "state":
          compareValue = (a.state || "").localeCompare(b.state || "");
          break;
        case "doctorName":
          compareValue = getDoctorName(a.doctorID).localeCompare(getDoctorName(b.doctorID));
          break;
        case "patientName":
          compareValue = getPatientName(a.patientID).localeCompare(getPatientName(b.patientID));
          break;
        case "consultationFee":
          compareValue = (a.consultationFee || 0) - (b.consultationFee || 0);
          break;
        default:
          compareValue = 0;
      }

      return compareValue;
    });

    setFilteredAppointments(filtered);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBangla = (status) => {
    switch (status) {
      case "completed":
        return "সম্পন্ন";
      case "pending":
        return "অপেক্ষমাণ";
      case "cancelled":
        return "বাতিল";
      case "confirmed":
        return "নিশ্চিত";
      default:
        return status;
    }
  };

  const handleViewDetails = (appointmentId) => {
    navigate(`/dashboardAdmin/appointments/${appointmentId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
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
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          অ্যাপয়েন্টমেন্ট তথ্য
        </h1>

        {/* Search and Filter Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="ডাক্তার বা রোগীর নাম দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* State Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                অবস্থা
              </label>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">সব</option>
                <option value="upcoming">আসন্ন</option>
                <option value="completed">সম্পন্ন</option>
                <option value="cancelled">বাতিল</option>
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                মাধ্যম
              </label>
              <select
                value={modeFilter}
                onChange={(e) => setModeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">সব</option>
                <option value="online">অনলাইন</option>
                <option value="offline">অফলাইন</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                সাজান
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt">তৈরির তারিখ</option>
                <option value="appointmentDate">অ্যাপয়েন্টমেন্ট তারিখ</option>
                <option value="state">অবস্থা</option>
                <option value="doctorName">ডাক্তারের নাম</option>
                <option value="patientName">রোগীর নাম</option>
                <option value="consultationFee">ফি</option>
              </select>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">মোট অ্যাপয়েন্টমেন্ট</p>
              <p className="text-2xl font-bold text-blue-600">{appointments.length}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">আসন্ন</p>
              <p className="text-2xl font-bold text-yellow-600">
                {appointments.filter(a => a.state === "upcoming").length}
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">সম্পন্ন</p>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.state === "completed").length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-sm text-gray-600">দেখানো হচ্ছে</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredAppointments.length}
              </p>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    রোগীর নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ডাক্তারের নাম
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    তারিখ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    সময়
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    অবস্থা
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    কার্যক্রম
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      কোনো অ্যাপয়েন্টমেন্ট পাওয়া যায়নি
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getPatientName(appointment.patientID)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.patientEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {getDoctorName(appointment.doctorID)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(appointment.appointmentDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatTime(appointment.appointmentTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                            appointment.state
                          )}`}
                        >
                          {getStatusBangla(appointment.state)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleViewDetails(appointment._id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md transition"
                          title="বিস্তারিত দেখুন"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-center text-gray-600">
          দেখানো হচ্ছে {filteredAppointments.length} টি অ্যাপয়েন্টমেন্ট (মোট {appointments.length} টি)
        </div>
      </div>
    </div>
  );
};

export default AppointmentInfo;
