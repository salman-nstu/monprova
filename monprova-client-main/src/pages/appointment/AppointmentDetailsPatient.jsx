import React, { useState, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import useAppointment from "../../hooks/useAppointment";
import useDoctor from "../../hooks/useDoctor";
import usePrescription from "../../hooks/usePrescription";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import { IoMdDownload } from "react-icons/io";
import { FaSpinner } from "react-icons/fa";
import useSchedule from "../../hooks/useSchedule";

// Make sure to import the FaSpinner icon
import pdfService from "../../pdfService";
import Swal from "sweetalert2";
import Button from "../../components/Button";


const AppointmentDetailsPatient = () => {
    const { appointmentId } = useParams();

    const [appointments, refetch] = useAppointment();
    const [doctors] = useDoctor();
    const [prescriptions] = usePrescription();
    const [schedules] = useSchedule();
    const axiosPublic = useAxiosPublic();

    const [pdfFile, setPdfFile] = useState(null);
    const [pdfUrl, setPdfUrl] = useState("");
    const [uploading, setUploading] = useState(false);

    const [showReschedule, setShowReschedule] = useState(false);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [rescheduleLoading, setRescheduleLoading] = useState(false);

    // Loading check FIRST
    if (!appointments || !doctors) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
            </div>
        );
    }

    // Define variables
    const appointment = appointments.find(a => a._id === appointmentId);
    const doctor = doctors.find(d => d._id === appointment?.doctorID);
    const doctorSchedule = schedules?.find(s => s.doctorID === appointment?.doctorID);
    const prescription = prescriptions?.find(p => p.appointmentID === appointmentId);

    if (!appointment || !doctor) {
        return (
            <div className="text-center text-xl text-red-500 mt-20">
                Appointment or Doctor not found
            </div>
        );
    }

    // NOW define hooks that depend on appointment
    const slotStartDate = useCallback((dateStr, slotStr) => {
        const startPart = (slotStr || "").split(" - ")[0];
        return new Date(`${dateStr} ${startPart}`);
    }, []);

    const isRescheduleLocked = useCallback(() => {
        if (!appointment?.appointmentDate || !appointment?.slot) return true;
        const start = slotStartDate(appointment.appointmentDate, appointment.slot);
        if (isNaN(start.getTime())) return true;
        const now = new Date();
        return start.getTime() - now.getTime() < 24 * 60 * 60 * 1000;
    }, [appointment, slotStartDate]);

    useEffect(() => {
        if (!doctorSchedule) {
            setAvailableSlots([]);
            return;
        }
        const slots = [];
        const now = new Date();
        const daysAhead = 14;
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        for (let i = 0; i < daysAhead; i++) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split("T")[0];
            const dayKey = days[date.getDay()];
            const daySlots = doctorSchedule?.availability?.[dayKey] || [];
            daySlots
                .filter((slot) => slot.status === "available")
                .forEach((slot) => {
                    const start = slotStartDate(dateStr, slot.time);
                    if (!isNaN(start.getTime()) && start > now) {
                        slots.push({ date: dateStr, slot: slot.time });
                    }
                });
        }
        setAvailableSlots(slots);
    }, [doctorSchedule, slotStartDate]);

    const gender = appointment.gender === "male" ? "পুরুষ" : appointment.gender === "female" ? "নারী" : "অন্যান্য";

    // ================= FILE HANDLERS =================
    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!pdfFile) {
            Swal.fire({
                icon: "warning",
                title: "ফাইল নির্বাচন করুন",
                text: "অনুগ্রহ করে একটি PDF ফাইল নির্বাচন করুন",
            });
            return;
        }

        const formData = new FormData();
        formData.append("pdf", pdfFile);
        formData.append("appointmentId", appointmentId);

        try {
            setUploading(true);

            Swal.fire({
                title: "PDF আপলোড হচ্ছে...",
                text: "অনুগ্রহ করে অপেক্ষা করুন",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const res = await fetch(`https://monprova-server.vercel.app/api/upload-prescription/${appointmentId}`, {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setPdfUrl(data.url);

            Swal.fire({
                icon: "success",
                title: "আপলোড সফল",
                text: "সফলভাবে আপলোড হয়েছে",
                timer: 1000,
                showConfirmButton: false,
            });
            refetch()
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "আপলোড ব্যর্থ",
                text: "আপলোড করা যায়নি",
            });
        } finally {
            setUploading(false);
        }
    };

    // ================= DOWNLOAD PRESCRIPTION =================
    const downloadPdfFile = async () => {
        try {
            Swal.fire({
                title: "প্রেসক্রিপশন ডাউনলোড হচ্ছে...",
                text: "অনুগ্রহ করে অপেক্ষা করুন",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await pdfService.downloadPDF(appointmentId);
            const blob = new Blob([response.data], { type: "application/pdf" });

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = "prescription.pdf";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            Swal.fire({
                icon: "success",
                title: "ডাউনলোড সম্পন্ন",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "ডাউনলোড ব্যর্থ",
                text: "প্রেসক্রিপশন ডাউনলোড করা যায়নি",
            });
        }
    };

    // ---------- Reschedule helpers ----------
    const openReschedule = () => {
        if (isRescheduleLocked()) {
            Swal.fire({
                icon: "warning",
                title: "রিশিডিউল করা যাবে না",
                text: "অ্যাপয়েন্টমেন্ট শুরু হতে ২৪ ঘণ্টার কম সময় বাকি।",
            });
            return;
        }
        setShowReschedule(true);
    };

    const submitReschedule = async () => {
        if (!selectedSlot) {
            Swal.fire({
                icon: "info",
                title: "স্লট নির্বাচন করুন",
                text: "রিশিডিউল করতে একটি নতুন সময় বেছে নিন।",
            });
            return;
        }
        try {
            setRescheduleLoading(true);
            await axiosPublic.patch(`/api/appointments/${appointmentId}/reschedule`, {
                newDate: selectedSlot.date,
                newSlot: selectedSlot.slot,
                actor: "patient",
            });
            Swal.fire({
                icon: "success",
                title: "রিশিডিউল সম্পন্ন",
                text: `${selectedSlot.date} ${selectedSlot.slot}`,
                timer: 2000,
                showConfirmButton: false,
            });
            setShowReschedule(false);
            setSelectedSlot(null);
            refetch();
        } catch (err) {
            const msg = err?.response?.data?.message || "রিশিডিউল করতে ব্যর্থ হয়েছে";
            Swal.fire({
                icon: "error",
                title: "রিশিডিউল ব্যর্থ",
                text: msg,
            });
        } finally {
            setRescheduleLoading(false);
        }
    };

    const rescheduleDisabled = isRescheduleLocked();
    const statusClass = appointment.state === "completed" ? "text-green-600" : "text-yellow-600";

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    {/* Section 1: Appointment Information */}
                    <div className="bg-blue-100 p-6 mb-8 card bg-base-100 shadow-md border border-blue-200 rounded-lg overflow-hidden transform transition-transform  hover:shadow-lg">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">অ্যাপয়েন্টমেন্ট সম্পর্কিত তথ্যসমূহঃ</h2>
                        <div className="space-y-4 text-gray-700">
                            <p><strong>মাধ্যমঃ</strong> <span className='bg-secondary-color text-white px-2 py-1 rounded-md text-sm'>{appointment.mode === 'online' ? "অনলাইন" : appointment.mode === 'offline' ? "অফলাইন" : "অনলাইন/অফলাইন"}</span></p>
                            <p><strong>তারিখঃ</strong> {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString("en-BD", { day: "2-digit", month: "long", year: "numeric" }) : "Not available"}</p>
                            <p><strong>সময়ঃ</strong> {appointment.slot || "Not available"}</p>
                            <p><strong>ফিঃ</strong> {doctor.consultationFee} টাকা</p>
                            <p><strong>স্ট্যাটাসঃ</strong> <span className={"font-semibold " + statusClass}>{appointment.state || "upcoming"}</span></p>
                            {
                                appointment.mode === 'offline' && (
                                    <p><strong>চেম্বারের ঠিকানা</strong> <span className={"font-semibold " + statusClass}>{doctor.chamber || "N/Aa"}</span></p>
                                )
                            }

                            <div className="mt-4">
                                <button
                                    onClick={openReschedule}
                                    disabled={rescheduleDisabled}
                                    className={
                                        "px-4 py-2 rounded-md font-semibold text-white " +
                                        (rescheduleDisabled
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-blue-600 hover:bg-blue-700")
                                    }
                                >
                                    রিশিডিউল করুন
                                </button>
                                {rescheduleDisabled && (
                                    <p className="text-sm text-red-500 mt-2">
                                        অ্যাপয়েন্টমেন্টের সময়ের ২৪ ঘণ্টার কম থাকায় রিশিডিউল করা যাবে না।
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Doctor Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-1 bg-green-50 p-5 rounded-lg border border-green-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="w-1 h-6 bg-green-500 mr-3 rounded"></span>
                                রোগীর তথ্যসমূহ
                            </h2>
                            <div className="space-y-2.5">
                                <div className="p-2.5 rounded-lg">
                                    <span className="font-semibold text-gray-700">রোগীর নামঃ</span>
                                    <span className="ml-2 text-gray-600">{appointment?.patientName || 'নাম নেই'}</span>
                                </div>
                                <div className="p-2.5 rounded-lg">
                                    <span className="font-semibold text-gray-700">মোবাইলঃ</span>
                                    <span className="ml-2 text-gray-600">{appointment?.phone || 'ফোন নেই'}</span>
                                </div>
                                <div className="p-2.5 rounded-lg">
                                    <span className="font-semibold text-gray-700">ইমেইলঃ</span>
                                    <span className="ml-2 text-gray-600">{appointment?.patientEmail || 'ইমেইল নেই'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5">
                                    <div className="p-2.5 rounded-lg">
                                        <span className="font-semibold text-gray-700 block text-sm">বয়স</span>
                                        <span className="text-gray-600">{appointment?.age || 0} বছর</span>
                                    </div>
                                    <div className="p-2.5 rounded-lg">
                                        <span className="font-semibold text-gray-700 block text-sm">জেন্ডার</span>
                                        <span className="text-gray-600">{gender}</span>
                                    </div>
                                    <div className="p-2.5 rounded-lg">
                                        <span className="font-semibold text-gray-700 block text-sm">ব্লাড</span>
                                        <span className="text-gray-600">{appointment?.bloodGroup || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="p-2.5 rounded-lg">
                                    <span className="font-semibold text-gray-700">পেশাঃ</span>
                                    <span className="ml-2 text-gray-600">{appointment?.profession || 'পেশা নেই'}</span>
                                </div>
                                <div className="p-2.5 rounded-lg">
                                    <span className="font-semibold text-gray-700 block mb-2">সমস্যা/রোগের বিবরণঃ</span>
                                    <p className="text-gray-600 leading-relaxed">{appointment?.problem || 'বিবরণ নেই'}</p>
                                </div>

                                {
                                    appointment.previousPrescription && (
                                        <div className="w-full">
                                            <Link to={`https://monprova-server-b72d8846b-tanjim-rooms-projects.vercel.app//download-pdf`}>
                                                <Button btnName="রোগীর দেওয়া প্রেস্ক্রিপশন" bgColor="bg-tertiary-color" />
                                            </Link>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                        
                        <div className="col-span-1 bg-purple-50 p-6 rounded-lg border flex-1 hover:shadow-lg transition-all duration-200 border-purple-200 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                                <span className="w-1 h-6 bg-purple-500 mr-3 rounded"></span>
                                ডাক্তারের তথ্যসমূহ
                            </h2>
                            <div className="flex items-center gap-6 mb-6">
                                <img
                                    src={
                                        doctor?.image ||
                                        "https://i.ibb.co/ym2wsZXY/avater-Grey-User-Circles-Set.png"
                                    }
                                    alt="Doctor"
                                    className="w-32 h-32 object-cover rounded-full shadow-md"
                                />
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold">{doctor.name}</h3>
                                    <p>{doctor.designation}</p>
                                    <p>{doctor.institute}</p>
                                    <p>{doctor.degrees}</p>
                                    <p className="text-sm text-gray-500">BMDC Reg No: {doctor.regNo}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-gray-700">
                                <p>
                                    <strong>অভিজ্ঞতা:</strong> {doctor.yearsOfExperience} বছর
                                </p>
                                <p>
                                    <strong>দক্ষতাসমূহ:</strong> {doctor.expertise}
                                </p>
                                <p>
                                    <strong>সংক্ষিপ্ত পরিচয়:</strong> {doctor.shortBio}
                                </p>
                                <p>
                                    <strong>রোগী দেখার মাধ্যম:</strong>{" "}
                                    <span className="bg-purple-500 text-white px-2 py-1 rounded">
                                        {doctor.medium === "online"
                                            ? "অনলাইন"
                                            : doctor.medium === "offline"
                                            ? "অফলাইন"
                                            : "অনলাইন/অফলাইন"}
                                    </span>
                                </p>
                                <p>
                                    <strong>পরামর্শ ফি:</strong> {doctor.consultationFee} টাকা
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-10 bg-white p-6 rounded-xl shadow border">
                        <h2 className="text-xl font-bold text-center mb-4">
                            প্রেসক্রিপশন আপলোড
                        </h2>

                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="file-input file-input-bordered w-full mb-4"
                        />

                        <button
                            onClick={handleUpload}
                            disabled={uploading || !pdfFile}
                            className={
                                `w-full py-3 rounded-md text-white font-semibold ` +
                                (uploading || !pdfFile ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700")
                            }
                        >
                            {uploading ? "আপলোড হচ্ছে..." : "আপলোড করুন"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Reschedule modal */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${showReschedule ? '' : 'hidden'}`}>
                <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6">
                    <h2 className="text-xl font-bold mb-4">রিশিডিউল অ্যাপয়েন্টমেন্ট</h2>
                    <div className="max-h-96 overflow-y-auto mb-4">
                        {availableSlots.length === 0 ? (
                            <p className="text-gray-600">কোনও উপলব্ধ স্লট নেই।</p>      
                        ) : (
                            <div className="grid grid-cols-1 gap-3">
                                {availableSlots.map((slot, index) => (
                                    <div                
                                        key={index}
                                        className={`p-3 border rounded-lg cursor-pointer hover:bg-blue-100 ${
                                            selectedSlot && selectedSlot.date === slot.date && selectedSlot.slot === slot.slot      
                                                ? "bg-blue-200 border-blue-600"                                     
                                                : "bg-white border-gray-300"    
                                        }`}
                                        onClick={() => setSelectedSlot(slot)}
                                    >                                                       
                                        <p>{slot.date} - {slot.slot}</p>                                  
                                    </div>                                 
                                ))}     
                            </div>
                        )}                                                                 
                    </div>          
                    <div className="flex justify-end space-x-4">                
                        <button
                            onClick={() => setShowReschedule(false)}                
                            className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold"          
                        >                                                                  
                            বাতিল করুন                                                                                        
                        </button>       
                        <button                 
                            onClick={submitReschedule}  
                            disabled={rescheduleLoading}
                            className={
                                `px-4 py-2 rounded-md text-white font-semibold ` +      
                                (rescheduleLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700")               
                            }       
                        >                                                                  
                            {rescheduleLoading ? "রিশিডিউল হচ্ছে..." : "রিশিডিউল করুন"}                                 
                        </button>           
                    </div>
                </div>
            </div>   
        </div>
    );
};

export default AppointmentDetailsPatient;
