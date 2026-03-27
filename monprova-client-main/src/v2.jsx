import React, { useState } from "react";
import { IoArrowBackSharp } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import usePrescription from "../../hooks/usePrescription";
import usePatient from "../../hooks/usePatient";
import useAppointment from "../../hooks/useAppointment";

const CreatePrescription = () => {
    const { appointmentId } = useParams();
    const axiosPublic = useAxiosPublic();
    const [appointments] = useAppointment();
    const appointment = appointments?.find(appointment => appointment._id === appointmentId);
    const patientID = appointment?.patientID;
    const doctorID = appointment?.doctorID;
    const [prescriptions] = usePrescription(); // Fetch prescriptions
    const prescription = prescriptions?.find(prescription => prescription.appointmentID === appointmentId);
    const [medicines, setMedicines] = useState(prescription?.medicines || [{ name: "", dose: "", duration: "" }]); // Initialize medicines
    const [diagnosis, setDiagnosis] = useState(prescription?.diagnosis || ''); // Set initial diagnosis
    const [advice, setAdvice] = useState(prescription?.advice || ''); // Set initial advice

    const navigate = useNavigate();

    const handleMedicineChange = (index, field, value) => {
        setMedicines((prevMedicines) => {
            const updatedMedicines = [...prevMedicines];
            updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
            return updatedMedicines;
        });
    };

    const addMedicine = () => {
        setMedicines((prevMedicines) => [
            ...prevMedicines,
            { name: "", dose: "", duration: "" },
        ]);
    };

    const removeMedicine = (index) => {
        setMedicines((prevMedicines) => {
            const filtered = prevMedicines.filter((_, i) => i !== index);
            return filtered.length > 0
                ? filtered
                : [{ name: "", dose: "", duration: "" }]; // Ensure at least one medicine field exists
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // ✅ Basic validation: Remove empty medicine rows
        const cleanedMeds = medicines.filter(
            (m) => (m.name || "").trim() || (m.dose || "").trim() || (m.duration || "").trim()
        );

        if (cleanedMeds.length === 0) {
            Swal.fire("ত্রুটি!", "কমপক্ষে একটি ঔষধের তথ্য প্রদান করুন।", "error");
            return; // Prevent submission if no valid medicines
        }

        const prescriptionInfo = {
            patientID,
            doctorID,
            appointmentID: appointmentId,
            diagnosis,
            advice,
            medicines: cleanedMeds, // Use cleaned medicines
        };

        try {
            const response = await axiosPublic.post(`/api/prescription`, prescriptionInfo);

            Swal.fire("সফল!", "প্রেসক্রিপশন সফলভাবে সংরক্ষিত হয়েছে।", "success");
            navigate(`/dashboardDoctor/appointmentDetailsDoctor/${appointmentId}`);
        } catch (err) {
            console.error("Error saving prescription:", err);
            const errorMessage = err.response?.data?.message || "প্রেসক্রিপশন সংরক্ষণে ত্রুটি হয়েছে।";
            Swal.fire("ত্রুটি!", errorMessage, "error");
        }
    };

    return (
        <div className="bg-[#EFF7FE] p-4 min-h-screen">
            <div className="mx-auto bg-white rounded-md shadow-md p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button className="border-2 rounded-md flex justify-center items-center hover:bg-[#E8594A] hover:text-white transition">
                        <Link
                            to={`/doctorDashboard/appointmentDetailsDoctor/${appointmentId}`}
                            className="flex items-center gap-6 px-4 py-2 font-semibold text-xl rounded-md"
                        >
                            <IoArrowBackSharp className="text-xl" />
                            <span className="text-center text-lg">পিছনে যান</span>
                        </Link>
                    </button>
                </div>

                <h2 className="text-xl text-gray-800 p-4 mb-8 font-bold text-center rounded-md bg-[#EFF7FE] border">
                    প্রেসক্রিপশন তৈরি
                </h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Diagnosis */}
                    <div>
                        <label className="block font-semibold mb-2">রোগ নির্ণয়</label>
                        <textarea
                            name="diagnosis"
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)} // Manage state for diagnosis
                            placeholder="রোগ নির্ণয়ের বিবরণ লিখুন..."
                            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#007AF5]"
                            rows="3"
                            required
                        />
                    </div>

                    {/* Medicines */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="block font-semibold">ঔষধের তালিকা</label>
                            <button
                                type="button"
                                onClick={addMedicine}
                                className="text-[#007AF5] font-semibold hover:underline"
                            >
                                + আরেকটি ঔষধ যোগ করুন
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2 font-semibold text-gray-700 text-sm">
                            <span>ঔষধের নাম</span>
                            <span>ডোজ</span>
                            <span>সময়কাল</span>
                        </div>

                        {medicines.map((med, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <input
                                    type="text"
                                    placeholder="ঔষধের নাম"
                                    value={med.name}
                                    onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                                    className="border rounded-md p-2 focus:ring-2 focus:ring-[#007AF5]"
                                />
                                <input
                                    type="text"
                                    placeholder="ডোজ (যেমন: 1+0+1)"
                                    value={med.dose}
                                    onChange={(e) => handleMedicineChange(index, "dose", e.target.value)}
                                    className="border rounded-md p-2 focus:ring-2 focus:ring-[#007AF5]"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="সময়কাল (যেমন: ৫ দিন)"
                                        value={med.duration}
                                        onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                                        className="border rounded-md p-2 flex-1 focus:ring-2 focus:ring-[#007AF5]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeMedicine(index)}
                                        className="text-red-500 font-bold px-3"
                                        title="Remove"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Advice */}
                    <div>
                        <label className="block font-semibold mb-2">পরামর্শ</label>
                        <textarea
                            name="advice"
                            value={advice}
                            onChange={(e) => setAdvice(e.target.value)} // Manage state for advice
                            placeholder="রোগীকে প্রদত্ত পরামর্শ..."
                            className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#007AF5]"
                            rows="3"
                            required
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="w-full bg-[#007AF5] text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-600 transition"
                        >
                            প্রেসক্রিপশন সংরক্ষণ করুন
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePrescription;
 <div className="bg-green-100 p-6 rounded-lg shadow hover:shadow-lg transition-all duration-200">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">রোগীর তথ্যসমূহ</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><span className="font-bold">রোগীর নামঃ</span> {appointment.patientName}</p>
                        <p><span className="font-bold">মোবাইলঃ</span> {appointment.phone}</p>
                        <p><span className="font-bold">ইমেইলঃ</span> {appointment.patientEmail}</p>
                        <p><span className="font-bold">বয়সঃ</span> {appointment.age} বছর</p>
                        <p><span className="font-bold">জেন্ডারঃ</span> {gender}</p>
                        <p><span className="font-bold">ব্লাড গ্রুপঃ</span> {appointment.bloodGroup}</p>
                        <p><span className="font-bold">পেশাঃ</span> {appointment.profession}</p>
                        <p><span className="font-bold">সমস্যা/রোগের বিবরণঃ</span> {appointment.problem}</p>
                    </div>
                </div>