import React from 'react';
import { IoMdDownload } from 'react-icons/io'; // Assuming you're using this for the download icon
import useDoctor from '../../hooks/useDoctor';
import usePatient from '../../hooks/usePatient';
import axios from 'axios';
import pdfService from '../../pdfService';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const PrescriptionCard = ({ prescription }) => {

  // Function to handle download
  const [doctors] = useDoctor();
  const doctor = doctors.find((d) => d._id === prescription.doctorID);
  const [patients] = usePatient();
  const patient = patients.find((p) => p._id === prescription.patientID);
  const appointmentId = prescription.appointmentID;

  const downloadPdfFile = async () => {
    try {
      // Show loading alert
      Swal.fire({
        title: 'প্রেসক্রিপশন ডাউনলোড হচ্ছে...',
        text: 'অনুগ্রহ করে অপেক্ষা করুন',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // API call
      const response = await pdfService.downloadPDF(appointmentId);

      // Create PDF blob
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Trigger download
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'prescription.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close loading & show success
      Swal.fire({
        icon: 'success',
        title: 'ডাউনলোড সম্পন্ন',
        text: 'প্রেসক্রিপশন সফলভাবে ডাউনলোড হয়েছে',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Error downloading PDF:", error);

      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'ডাউনলোড ব্যর্থ',
        text: 'প্রেসক্রিপশন ডাউনলোড করা যায়নি'
      });
    }
  };


  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6">

      {/* Doctor Info */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative">
          <img
            src={doctor?.image}
            alt={doctor?.name}
            className="w-14 h-14 object-cover rounded-full ring-2 ring-secondary-color"
          />
          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800">
            {doctor?.name}
          </h2>
          <p className="text-sm text-secondary-color font-medium">
            {doctor?.designation}
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-200 my-4"></div>

      {/* Patient & Date */}
      <div className="space-y-2 text-gray-700">
        <p className="flex items-center gap-2">
          <span className="font-semibold">রোগীঃ</span>
          <span className="text-gray-600">{patient?.name || "N/A"}</span>
        </p>

        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-700">তারিখঃ </span>
          {new Date(
            prescription?.updatedAt || prescription?.createdAt
          ).toLocaleString("default", {
            weekday: "long",
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Download Button */}
      <div className="mt-6 space-y-2">
          <div className=''>
             <Link to={`/dashboardPatient/prescriptionDetails/${appointmentId}`} className="flex-1">
          <button className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold bg-blue-400 text-white
                 bg-gradient-to-r from-secondary-color to-green-600
                 hover:from-green-600 hover:bg-secondary-color
                 transition-all duration-300 shadow-md hover:shadow-lg">
            প্রেস্ক্রিপশন দেখুন
          </button>
        </Link>
          </div>
       <div>
         <button
          onClick={downloadPdfFile}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold bg-blue-400 text-white
                 bg-gradient-to-r from-secondary-color to-blue-600
                 hover:from-blue-600 hover:bg-secondary-color
                 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <IoMdDownload className="text-2xl" />
          প্রেসক্রিপশন ডাউনলোড করুন
        </button>
       </div>
      </div>

    </div>

  );
};

export default PrescriptionCard;
