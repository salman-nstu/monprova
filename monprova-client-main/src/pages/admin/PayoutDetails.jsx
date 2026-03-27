import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAxiosSecure from "../../hooks/useAxiosSecure";
import BackButton from "../../components/BackButton";
import Swal from "sweetalert2";
import useUser from "../../hooks/useUser";

const PayoutDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
 
  const [payout, setPayout] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayoutDetails();
    fetchDoctors();
  }, [id]);

  const fetchDoctors = async () => {
    try {
      const response = await axiosSecure.get("/api/doctors");
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchPayoutDetails = async () => {
    try {
      const response = await axiosSecure.get(`/api/payouts/${id}`);
      setPayout(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching payout details:", error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "পেআউট বিস্তারিত তথ্য লোড করতে সমস্যা হয়েছে",
        confirmButtonColor: "#d33"
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!payout) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-600">পেআউট পাওয়া যায়নি</div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get doctor name from payout or fetch from doctors list
  const getDoctorName = () => {
    if (payout?.doctorName) {
      return payout.doctorName;
    }
    const doctor = doctors.find(d => d._id === payout?.doctorId);
    return doctor?.name || doctor?.fullName || "Unknown";
  };

  return (
    <div className="min-h-screen bg-[#E6F0FF] p-8">
      <div className="max-w-4xl mx-auto">
        <BackButton destination="/dashboardAdmin/payout" />
        
        <div className="bg-white shadow-lg rounded-lg p-8 mt-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            পেআউট বিস্তারিত তথ্য
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payout ID */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">পেআউট আইডি</p>
              <p className="text-lg text-gray-800">{payout._id}</p>
            </div>

            {/* Date */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">তারিখ</p>
              <p className="text-lg text-gray-800">{formatDate(payout.timestamp)}</p>
            </div>

            {/* Doctor ID */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ডাক্তার আইডি</p>
              <p className="text-lg text-gray-800">{payout.doctorId}</p>
            </div>

            {/* Doctor Name */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ডাক্তারের নাম</p>
              <p className="text-lg text-gray-800">{getDoctorName()}</p>
            </div>

            {/* Amount */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">পরিমাণ (ডাক্তারকে প্রদান)</p>
              <p className="text-2xl font-bold text-green-600">৳ {Number(payout.amount).toFixed(2)}</p>
            </div>

            {/* Transaction ID */}
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">ট্রানজেকশন আইডি</p>
              <p className="text-lg text-gray-800">{payout.transactionId}</p>
            </div>

            {/* Payment Method */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">পেমেন্ট মাধ্যম</p>
              <p className="text-lg text-gray-800">{payout.method}</p>
            </div>

            {/* Account Number */}
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">একাউন্ট নাম্বার</p>
              <p className="text-lg text-gray-800">{payout.accountNumber}</p>
            </div>

            {/* Admin Email */}
            {payout.adminEmail && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                <p className="text-sm text-gray-600 mb-1 font-semibold">অ্যাডমিন ইমেইল</p>
                <p className="text-lg text-gray-800">{payout.adminEmail}</p>
              </div>
            )}

            {/* Note */}
            {payout.note && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                <p className="text-sm text-gray-600 mb-1 font-semibold">নোট</p>
                <p className="text-lg text-gray-800">{payout.note}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
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

export default PayoutDetails;
