import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import BackButton from "../../components/BackButton";
import Swal from "sweetalert2";

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    upcoming: 0,
    completed: 0
  });

  useEffect(() => {
    fetchDoctorDetails();
    fetchAppointments();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      const response = await axiosSecure.get(`/api/doctors/${id}`);
      setDoctor(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: error.response?.data?.message || "ডাক্তারের তথ্য লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axiosSecure.get("/api/appointments");
      const doctorAppointments = response.data.filter(
        apt => apt.doctorID === id && apt.paymentStatus === "paid"
      );
      setAppointments(doctorAppointments);
      
      // Calculate statistics
      const upcoming = doctorAppointments.filter(apt => apt.state === "upcoming").length;
      const completed = doctorAppointments.filter(apt => apt.state === "completed").length;
      
      setAppointmentStats({
        total: doctorAppointments.length,
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
      text: `আপনি কি "${doctor.name || doctor.email}" কে মুছে ফেলতে চান?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "হ্যাঁ, মুছে ফেলুন!",
      cancelButtonText: "বাতিল"
    });

    if (result.isConfirmed) {
      try {
        const response = await axiosSecure.delete(`/api/doctors/${id}`);
        if (response.data.deletedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "সফল!",
            text: "ডাক্তার সফলভাবে মুছে ফেলা হয়েছে",
            confirmButtonColor: "#10b981"
          });
          navigate("/dashboardAdmin/doctors");
        }
      } catch (error) {
        console.error("Error deleting doctor:", error);
        Swal.fire({
          icon: "error",
          title: "ত্রুটি!",
          text: error.response?.data?.message || "ডাক্তার মুছতে সমস্যা হয়েছে",
          confirmButtonColor: "#d33"
        });
      }
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

  if (!doctor) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">ডাক্তার পাওয়া যায়নি</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-4xl mx-auto">
        <BackButton destination="/dashboardAdmin/doctors" />

        <div className="bg-white shadow-lg rounded-lg p-8 mt-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            ডাক্তারের বিস্তারিত তথ্য
          </h2>

          {/* Verification Status Badge */}
          <div className="mb-6 flex justify-center">
            {doctor.verificationStatus === 'verified' ? (
              <span className="px-6 py-3 rounded-full bg-green-100 text-green-700 text-lg font-semibold border-2 border-green-300">
                ✓ ভেরিফাইড
              </span>
            ) : doctor.verificationStatus === 'pending' ? (
              <span className="px-6 py-3 rounded-full bg-yellow-100 text-yellow-700 text-lg font-semibold border-2 border-yellow-300">
                ⏳ অপেক্ষমাণ
              </span>
            ) : doctor.verificationStatus === 'rejected' ? (
              <span className="px-6 py-3 rounded-full bg-red-100 text-red-700 text-lg font-semibold border-2 border-red-300">
                ✗ প্রত্যাখ্যাত
              </span>
            ) : (
              <span className="px-6 py-3 rounded-full bg-gray-100 text-gray-700 text-lg font-semibold border-2 border-gray-300">
                ○ ভেরিফাইড নয়
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
            {/* Doctor ID */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ডাক্তার আইডি</p>
              <p className="text-lg text-gray-800">{doctor._id}</p>
            </div>

            {/* Name */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">নাম</p>
              <p className="text-lg text-gray-800">{doctor.name || "N/A"}</p>
            </div>

            {/* Email */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ইমেইল</p>
              <p className="text-lg text-gray-800">{doctor.email}</p>
            </div>

            {/* Phone */}
            {doctor.phone && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">ফোন</p>
                <p className="text-lg text-gray-800">{doctor.phone}</p>
              </div>
            )}

            {/* Designation */}
            {doctor.designation && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">পদবী</p>
                <p className="text-lg text-gray-800">{doctor.designation}</p>
              </div>
            )}

            {/* Expertise */}
            {doctor.expertise && (
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">বিশেষত্ব</p>
                <p className="text-lg text-gray-800">{doctor.expertise}</p>
              </div>
            )}

            {/* Consultation Fee */}
            {doctor.consultationFee && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">পরামর্শ ফি</p>
                <p className="text-2xl font-bold text-green-600">৳ {doctor.consultationFee}</p>
              </div>
            )}

            {/* Degrees */}
            {doctor.degrees && (
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">ডিগ্রি</p>
                <p className="text-lg text-gray-800">{doctor.degrees}</p>
              </div>
            )}

            {/* Years of Experience */}
            {doctor.yearsOfExperience && (
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">অভিজ্ঞতা</p>
                <p className="text-lg text-gray-800">{doctor.yearsOfExperience} বছর</p>
              </div>
            )}

            {/* Registration Number */}
            {doctor.regNo && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">রেজিস্ট্রেশন নং</p>
                <p className="text-lg text-gray-800">{doctor.regNo}</p>
              </div>
            )}

            {/* Institute */}
            {doctor.institute && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">প্রতিষ্ঠান</p>
                <p className="text-lg text-gray-800">{doctor.institute}</p>
              </div>
            )}

            {/* Chamber */}
            {doctor.chamber && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">চেম্বার</p>
                <p className="text-lg text-gray-800">{doctor.chamber}</p>
              </div>
            )}

            {/* Division */}
            {doctor.division && (
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">বিভাগ</p>
                <p className="text-lg text-gray-800">{doctor.division}</p>
              </div>
            )}

            {/* Medium */}
            {doctor.medium && (
              <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">মাধ্যম</p>
                <p className="text-lg text-gray-800">{doctor.medium}</p>
              </div>
            )}

            {/* Mobile Number */}
            {doctor.mobileNo && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">মোবাইল</p>
                <p className="text-lg text-gray-800">{doctor.mobileNo}</p>
              </div>
            )}

            {/* NID Number */}
            {doctor.nidNo && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">জাতীয় পরিচয়পত্র নং</p>
                <p className="text-lg text-gray-800">{doctor.nidNo}</p>
              </div>
            )}

            {/* Bkash Account */}
            {doctor.bkashAccount && (
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">বিকাশ অ্যাকাউন্ট</p>
                <p className="text-lg text-gray-800">{doctor.bkashAccount}</p>
              </div>
            )}

            {/* Registration Date */}
            {doctor.createdAt && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">নিবন্ধনের তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(doctor.createdAt)}</p>
              </div>
            )}

            {/* Last Updated */}
            {doctor.updatedAt && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">সর্বশেষ আপডেট</p>
                <p className="text-lg text-gray-800">{formatDate(doctor.updatedAt)}</p>
              </div>
            )}

            {/* Verification Request Date */}
            {doctor.verificationRequestedAt && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">ভেরিফিকেশন অনুরোধের তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(doctor.verificationRequestedAt)}</p>
              </div>
            )}

            {/* Verified At */}
            {doctor.verifiedAt && doctor.verificationStatus === 'verified' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">ভেরিফাই করার তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(doctor.verifiedAt)}</p>
              </div>
            )}

            {/* Verification Updated At (for rejected status) */}
            {doctor.verificationUpdatedAt && doctor.verificationStatus === 'rejected' && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-gray-600 mb-1 font-semibold">প্রত্যাখ্যানের তারিখ</p>
                <p className="text-lg text-gray-800">{formatDate(doctor.verificationUpdatedAt)}</p>
              </div>
            )}
          </div>

          {/* Rejection Reason */}
          {doctor.verificationStatus === 'rejected' && doctor.rejectionReason && (
            <div className="mt-6 bg-red-50 border-2 border-red-200 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-semibold mb-2">প্রত্যাখ্যানের কারণ:</p>
              <p className="text-gray-800">{doctor.rejectionReason}</p>
            </div>
          )}

          {/* Bio/Description */}
          {doctor.shortBio && (
            <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">সম্পর্কে</p>
              <p className="text-gray-800">{doctor.shortBio}</p>
            </div>
          )}

          {/* Profile Image */}
          {doctor.image && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-semibold mb-3">প্রোফাইল ছবি:</p>
              <div className="flex justify-center">
                <img 
                  src={doctor.image} 
                  alt="Doctor Profile"
                  className="w-48 h-48 object-cover rounded-full border-4 border-gray-200 cursor-pointer hover:opacity-90 transition"
                  onClick={() => window.open(doctor.image, '_blank')}
                />
              </div>
            </div>
          )}

          {/* NID Images */}
          {(doctor.nidFront || doctor.nidBack) && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-semibold mb-3">জাতীয় পরিচয়পত্র (NID):</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.nidFront && (
                  <div className="border rounded-lg overflow-hidden">
                    <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2">NID সামনের অংশ</p>
                    <img 
                      src={doctor.nidFront} 
                      alt="NID Front"
                      className="w-full h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(doctor.nidFront, '_blank')}
                    />
                  </div>
                )}
                {doctor.nidBack && (
                  <div className="border rounded-lg overflow-hidden">
                    <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2">NID পিছনের অংশ</p>
                    <img 
                      src={doctor.nidBack} 
                      alt="NID Back"
                      className="w-full h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(doctor.nidBack, '_blank')}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certificates */}
          {doctor.certificates && doctor.certificates.length > 0 && (
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-semibold mb-3">সার্টিফিকেট ও ডিগ্রি:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.certificates.map((cert, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2">সার্টিফিকেট {index + 1}</p>
                    <img 
                      src={cert} 
                      alt={`Certificate ${index + 1}`}
                      className="w-full h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition"
                      onClick={() => window.open(cert, '_blank')}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/dashboardAdmin/doctors")}
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

export default DoctorDetails;
