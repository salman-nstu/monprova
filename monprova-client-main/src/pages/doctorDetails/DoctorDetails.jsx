import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import BackButton from '../../components/BackButton';
import useDoctor from '../../hooks/useDoctor';
import { AuthContext } from '../../providers/AuthProvider';
import Swal from 'sweetalert2';

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctors] = useDoctor();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Loading state
  if (loading) {
    return (
      <p className="text-center mt-10 text-lg text-gray-600">
        Loading doctor details...
      </p>
    );
  }

  // Error state
  if (error) {
    return (
      <p className="text-center mt-10 text-lg text-red-500">
        {error}
      </p>
    );
  }

  // Find doctor by ID
  const doctor = doctors.find(doctor => doctor._id === doctorId);

  if (!doctor) {
    return (
      <p className="text-center mt-10 text-lg text-gray-600">
        Doctor not found.
      </p>
    );
  }

  // Destructure safely with defaults
  const { _id, name, designation, expertise, consultationFee, image, yearsOfExperience, degrees, regNo, institute, medium, shortBio } = doctor;

  const handleAppointmentClick = (e) => {
    if (!user) {
      e.preventDefault();
      Swal.fire({
        title: "লগইন প্রয়োজন",
        text: "অ্যাপয়েন্টমেন্ট বুক করতে আপনাকে লগইন বা সাইন আপ করতে হবে।",
        icon: "info",
        confirmButtonText: "ঠিক আছে",
      }).then(() => {
        navigate("/");
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">

          {/* Back Button */}
          <div className='p-6 bg-gray-50 border-b'>
            <BackButton destination={user ? "/dashboardPatient/doctorList" : "/doctorList"}></BackButton>
          </div>

          {/* Doctor Info Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className='flex-shrink-0'>
                <img
                  src={image || "https://i.ibb.co.com/ym2wsZXY/avater-Grey-User-Circles-Set.png"}
                  alt={name}
                  className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <h1 className="text-3xl font-bold text-gray-800">{name}</h1>
                <p className="text-xl font-semibold text-gray-700">{designation}</p>
                <p className="text-lg text-blue-600 font-medium">{degrees}</p>
                <div className="inline-block bg-white px-4 py-2 rounded-lg shadow">
                  <p className="text-sm text-gray-600">
                    BMDC Reg. No: <span className="font-bold text-gray-800">{regNo}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Doctor Details */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Left Column */}
              <div className='space-y-6'>
                {/* Workplace */}
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded"></span>
                    কর্মক্ষেত্র
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 mb-1">{designation}</p>
                    <p className="font-semibold text-gray-800">{institute}</p>
                  </div>
                </div>

                {/* Specialities */}
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded"></span>
                    দক্ষতাসমূহ
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{expertise}</p>
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded"></span>
                    অভিজ্ঞতা
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-semibold text-gray-800 text-lg">{yearsOfExperience} বছর</p>
                  </div>
                </div>

                {
                  doctor?.chamber && (
                    <div>
                      <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
                        <span className="w-1 h-6 bg-blue-600 rounded"></span>
                        চেম্বারের ঠিকানা
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-semibold text-gray-800 text-lg">{doctor.chamber} </p>
                      </div>
                    </div>
                  )
                }
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                {/* Bio */}
                <div>
                  <h3 className="text-xl font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded"></span>
                    সংক্ষিপ্ত পরিচয়
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-justify leading-relaxed">{shortBio || "কোনো বিবরণ নেই"}</p>
                  </div>
                </div>

                {/* Consultation Info */}
                <div className="space-y-4">
                  {/* Consultation Type */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">রোগী দেখার মাধ্যম</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                        {medium === 'online' ? "অনলাইন" : medium === 'offline' ? "অফলাইন" : "অনলাইন/অফলাইন"}
                      </div>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">পরামর্শ ফি</p>
                    <div className="flex items-center gap-2">
                      <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold text-lg">
                        ৳ {consultationFee}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Button */}
          <div className="p-8 bg-gray-50 border-t">
            <Link to={user ? `/dashboardPatient/appointmentForm/${doctorId}` : "#"} onClick={handleAppointmentClick}>
              <Button btnName="অ্যাপয়েন্টমেন্ট নিন" bgColor="bg-primary-color w-full text-lg py-4 hover:bg-blue-700 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
