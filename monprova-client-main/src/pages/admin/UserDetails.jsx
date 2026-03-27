import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import BackButton from "../../components/BackButton";
import Swal from "sweetalert2";

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [user, setUser] = useState(null);
  const [patientProfile, setPatientProfile] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserDetails();
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const response = await axiosSecure.get(`/api/users/${id}`);
      const userData = response.data;
      setUser(userData);
      // Fetch patient profile after we have the email
      await fetchPatientProfileByEmail(userData.email);
      await fetchAppointmentsByEmail(userData.email);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user details:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: error.response?.data?.message || "ব্যবহারকারীর তথ্য লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
      setLoading(false);
    }
  };

  const fetchPatientProfileByEmail = async (email) => {
    try {
      const response = await axiosSecure.get(`/api/patients/email/${email}`);
      setPatientProfile(response.data);
    } catch (error) {
      console.log("No patient profile found or error:", error);
    }
  };

  const fetchAppointmentsByEmail = async (email) => {
    try {
      const response = await axiosSecure.get("/api/appointments");
      const userAppointments = response.data.filter(
        apt => apt.patientEmail === email && apt.paymentStatus === "paid"
      );
      setAppointments(userAppointments);
      
      // Calculate statistics
      const upcoming = userAppointments.filter(apt => apt.state === "upcoming").length;
      const completed = userAppointments.filter(apt => apt.state === "completed").length;
      
      setAppointmentStats({
        total: userAppointments.length,
        upcoming: upcoming,
        completed: completed
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "নিশ্চিত করুন",
      text: `আপনি কি "${user.name || user.email}" কে মুছে ফেলতে চান?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
      cancelButtonText: "বাতিল"
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosSecure.delete(`/api/users/${id}`);
        if (response.data.deletedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "সফল!",
            text: "ব্যবহারকারী সফলভাবে মুছে ফেলা হয়েছে",
            confirmButtonColor: "#10b981"
          });
          navigate("/dashboardAdmin/users");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire({
          icon: "error",
          title: "ত্রুটি!",
          text: error.response?.data?.message || "ব্যবহারকারী মুছতে সমস্যা হয়েছে",
          confirmButtonColor: "#d33"
        });
      }
    }
  };

  const getRoleBangla = (role) => {
    switch (role) {
      case "admin":
        return "অ্যাডমিন";
      case "doctor":
        return "ডাক্তার";
      case "patient":
        return "রোগী";
      default:
        return role;
    }
  };

  const getGenderBangla = (gender) => {
    switch (gender) {
      case "male":
        return "পুরুষ";
      case "female":
        return "নারী";
      case "other":
        return "অন্যান্য";
      default:
        return gender || "N/A";
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "doctor":
        return "bg-blue-100 text-blue-800";
      case "patient":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">ব্যবহারকারী পাওয়া যায়নি</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-4xl mx-auto">
        <BackButton destination="/dashboardAdmin/users" />

        <div className="bg-white shadow-lg rounded-lg p-8 mt-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ব্যবহারকারীর বিস্তারিত তথ্য
          </h2>

          {/* Profile Status Badge */}
          <div className="mb-6 flex justify-center">
            {patientProfile ? (
              <span className="px-6 py-3 rounded-full bg-green-100 text-green-700 text-lg font-semibold border-2 border-green-300">
                ✓ সম্পূর্ণ প্রোফাইল
              </span>
            ) : (
              <span className="px-6 py-3 rounded-full bg-gray-100 text-gray-700 text-lg font-semibold border-2 border-gray-300">
                ○ অসম্পূর্ণ প্রোফাইল
              </span>
            )}
          </div>

          {/* Appointment Statistics */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 font-semibold mb-1">মোট অ্যাপয়েন্টমেন্ট</p>
              <p className="text-3xl font-bold text-blue-600">{appointmentStats.total}</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 font-semibold mb-1">আসন্ন অ্যাপয়েন্টমেন্ট</p>
              <p className="text-3xl font-bold text-yellow-600">{appointmentStats.upcoming}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 font-semibold mb-1">সম্পন্ন অ্যাপয়েন্টমেন্ট</p>
              <p className="text-3xl font-bold text-green-600">{appointmentStats.completed}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* User ID */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ব্যবহারকারী আইডি</p>
              <p className="text-lg text-gray-800">{user._id}</p>
            </div>

            {/* Name */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">নাম</p>
              <p className="text-lg text-gray-800">{patientProfile?.name || user.name || "N/A"}</p>
            </div>

            {/* Email */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ইমেইল</p>
              <p className="text-lg text-gray-800">{user.email}</p>
            </div>

            {/* Role */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ভূমিকা</p>
              <span
                className={`inline-block px-4 py-2 text-lg font-semibold rounded-full ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {getRoleBangla(user.role)}
              </span>
            </div>

            {/* Age */}
            {patientProfile?.age && (
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">বয়স</p>
                <p className="text-lg text-gray-800">{patientProfile.age} বছর</p>
              </div>
            )}

            {/* Gender */}
            {patientProfile?.gender && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">লিঙ্গ</p>
                <p className="text-lg text-gray-800">{getGenderBangla(patientProfile.gender)}</p>
              </div>
            )}

            {/* Phone */}
            {patientProfile?.phone && (
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">মোবাইল</p>
                <p className="text-lg text-gray-800">{patientProfile.phone}</p>
              </div>
            )}

            {/* Blood Group */}
            {patientProfile?.bloodGroup && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">রক্তের গ্রুপ</p>
                <p className="text-lg text-gray-800">{patientProfile.bloodGroup}</p>
              </div>
            )}

            {/* Profession */}
            {patientProfile?.profession && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">পেশা</p>
                <p className="text-lg text-gray-800">{patientProfile.profession}</p>
              </div>
            )}

            {/* Emergency Contact */}
            {patientProfile?.emergencyContact && (
              <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">জরুরি যোগাযোগ</p>
                <p className="text-lg text-gray-800">{patientProfile.emergencyContact}</p>
              </div>
            )}

            {/* Created At */}
            {user.createdAt && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">নিবন্ধনের তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(user.createdAt)}</p>
              </div>
            )}

            {/* Last Updated */}
            {user.updatedAt && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">সর্বশেষ আপডেট</p>
                <p className="text-lg text-gray-800">{formatDate(user.updatedAt)}</p>
              </div>
            )}

            {/* Profile Created At */}
            {patientProfile?.createdAt && (
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">প্রোফাইল তৈরির তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(patientProfile.createdAt)}</p>
              </div>
            )}

            {/* Profile Updated At */}
            {patientProfile?.updatedAt && (
              <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">প্রোফাইল আপডেটের তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(patientProfile.updatedAt)}</p>
              </div>
            )}
          </div>

          {/* Address */}
          {patientProfile?.address && (
            <div className="mt-6 bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-gray-600 font-semibold mb-2">ঠিকানা</p>
              <p className="text-gray-800">{patientProfile.address}</p>
            </div>
          )}

          {/* Profile Image */}
          {patientProfile?.image && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-semibold mb-3">প্রোফাইল ছবি:</p>
              <div className="flex justify-center">
                <img 
                  src={patientProfile.image} 
                  alt="Patient Profile"
                  className="w-48 h-48 object-cover rounded-full border-4 border-gray-200 cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(patientProfile.image, '_blank')}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/dashboardAdmin/users")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-md transition"
            >
              ফিরে যান
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-8 py-3 rounded-md transition"
            >
              মুছে ফেলুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
