import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import BackButton from "../../components/BackButton";
import Swal from "sweetalert2";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [appointment, setAppointment] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const fetchAppointmentDetails = async () => {
    try {
      // Fetch appointment
      const appointmentRes = await axiosSecure.get(`/api/appointments/${id}`);
      const appointmentData = appointmentRes.data;
      setAppointment(appointmentData);

      // Fetch doctor details
      if (appointmentData.doctorID) {
        const doctorRes = await axiosSecure.get(`/api/doctors/${appointmentData.doctorID}`);
        setDoctor(doctorRes.data);
      }

      // Fetch patient details (try users collection first as it is the primary auth record)
      if (appointmentData.patientID) {
        try {
            const patientRes = await axiosSecure.get(`/api/users/${appointmentData.patientID}`);
            setPatient(patientRes.data);
        } catch (e) {
            // Fallback to patients collection if users fail
             const patientRes = await axiosSecure.get(`/api/patients/${appointmentData.patientID}`);
             setPatient(patientRes.data);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching appointment details:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: error.response?.data?.message || "অ্যাপয়েন্টমেন্টের তথ্য লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">অ্যাপয়েন্টমেন্ট পাওয়া যায়নি</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-4xl mx-auto">
        <BackButton destination="/dashboardAdmin/appointmentInfo" />

        <div className="bg-white shadow-lg rounded-lg p-8 mt-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            অ্যাপয়েন্টমেন্টের বিস্তারিত তথ্য
          </h2>

          {/* Status Badge */}
          <div className="flex justify-center mb-6">
            <span
              className={`px-6 py-2 text-lg font-semibold rounded-full ${getStatusBadgeColor(
                appointment.state
              )}`}
            >
              {getStatusBangla(appointment.state)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointment ID */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">অ্যাপয়েন্টমেন্ট আইডি</p>
              <p className="text-lg text-gray-800">{appointment._id}</p>
            </div>

            {/* Patient Name */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">রোগীর নাম</p>
              <p className="text-lg text-gray-800">{patient?.name || "N/A"}</p>
            </div>

            {/* Patient Email */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">রোগীর ইমেইল</p>
              <p className="text-lg text-gray-800">{appointment.patientEmail || "N/A"}</p>
            </div>

            {/* Patient Phone */}
            {patient?.phone && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">রোগীর ফোন</p>
                <p className="text-lg text-gray-800">{patient.phone}</p>
              </div>
            )}

            {/* Doctor Name */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ডাক্তারের নাম</p>
              <p className="text-lg text-gray-800">{doctor?.name || "N/A"}</p>
            </div>

            {/* Doctor Expertise */}
            {doctor?.expertise && (
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">ডাক্তারের বিশেষত্ব</p>
                <p className="text-lg text-gray-800">{doctor.expertise}</p>
              </div>
            )}

            {/* Appointment Date */}
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">তারিখ</p>
              <p className="text-lg text-gray-800">{formatDate(appointment.appointmentDate)}</p>
            </div>

            {/* Appointment Time */}
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">সময়</p>
              <p className="text-lg text-gray-800">{appointment.appointmentTime || "N/A"}</p>
            </div>

            {/* Consultation Fee */}
            {doctor?.consultationFee && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">পরামর্শ ফি</p>
                <p className="text-2xl font-bold text-green-600">৳ {doctor.consultationFee}</p>
              </div>
            )}

            {/* Created At */}
            {appointment.createdAt && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">নিবন্ধনের তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(appointment.createdAt)}</p>
              </div>
            )}
          </div>

          {/* Patient Problem/Complaint */}
          {appointment.problem && (
            <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">রোগীর সমস্যা</p>
              <p className="text-gray-800">{appointment.problem}</p>
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">নোট</p>
              <p className="text-gray-800">{appointment.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/dashboardAdmin/appointmentInfo")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-md transition"
            >
              ফিরে যান
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
