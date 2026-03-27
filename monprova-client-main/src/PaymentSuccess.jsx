import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosPublic from "./hooks/useAxiosPublic";

const PaymentSuccess = () => {
  const axiosPublic = useAxiosPublic();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmAppointment = async () => {
      const appointmentInfo = JSON.parse(localStorage.getItem("pendingAppointment"));

      if (!appointmentInfo) return;

      try {

        Swal.fire({
          title: "সফল!",
          text: "আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে।",
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });

        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/dashboardPatient/appointment"); // change to your desired page
        }, 3000);
      } catch (error) {
        Swal.fire({
          title: "ত্রুটি!",
          text: "অ্যাপয়েন্টমেন্ট বুক করা যায়নি। আবার চেষ্টা করুন।",
          icon: "error",
          confirmButtonText: "ঠিক আছে"
        });
      }
    };

    confirmAppointment();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-green-50">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-md">
        <svg
          className="w-20 h-20 mx-auto text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h2 className="text-2xl font-bold mt-5 mb-2 text-green-700">সফলভাবে পেমেন্ট হয়েছে!</h2>
        <p className="text-gray-600 mb-4">আপনার অ্যাপয়েন্টমেন্ট সফলভাবে বুক হয়েছে।</p>
        <p className="text-gray-500 text-sm">আপনি 3 সেকেন্ডের মধ্যে ড্যাশবোর্ডে রিডাইরেক্ট হবেন।</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
