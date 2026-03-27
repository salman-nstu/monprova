import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAxiosPublic from '../../hooks/useAxiosPublic';
import useAppointment from '../../hooks/useAppointment';
import usePrescription from '../../hooks/usePrescription';
import Swal from 'sweetalert2';

const CreatePrescription = () => {
    const { appointmentId } = useParams();
    const axiosPublic = useAxiosPublic();
    const [appointments] = useAppointment();
    const appointment = appointments?.find(appointment => appointment._id === appointmentId);
    const appointmentID = appointment?._id;
    const patientID = appointment?.patientID;
    const doctorID = appointment?.doctorID;
    const [prescriptions, refetch] = usePrescription(); // Fetch prescriptions
    const prescription = prescriptions?.find(prescription => prescription.appointmentID === appointmentId);
    const navigate = useNavigate();
    
    const [patientName, setPatientName] = useState('');
    const [gender, setGender] = useState('');
    const [age, setAge] = useState('');
    const [chiefComplaints, setChiefComplaints] = useState(prescription?.chiefComplaints || '');
    const [medications, setMedications] = useState(prescription?.medications || [
        { name: '', dosage: '', instructions: '', duration: '' },
    ]);
    const [followUp, setFollowUp] = useState(prescription?.followUp || '');
    const [advice, setAdvice] = useState(prescription?.advice || '');
    const [tests, setTests] = useState(prescription?.tests || '');  // New field for test
    const [loading, setLoading] = useState(false); // For loading state

    // Pre-fill patient details if available
    useEffect(() => {
        if (appointment) {
            setPatientName(appointment?.patientName || '');
            setGender(appointment?.gender || '');
            setAge(appointment?.age || '');
        }
    }, [appointment]);

    const handleAddMedication = () => {
        setMedications([
            ...medications,
            { name: '', dosage: '', instructions: '', duration: '' },
        ]);
    };

    const handleRemoveMedication = (index) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const handleInputChange = (e, index, field) => {
        const updatedMedications = [...medications];
        updatedMedications[index][field] = e.target.value;
        setMedications(updatedMedications);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const prescriptionData = {
            appointmentID,
            patientName,
            gender,
            age,
            chiefComplaints,
            medications,
            followUp,
            advice,
            tests,  // Including the new test field
            patientID,
            doctorID,
            
        };

        setLoading(true); // Start loading

        try {
            const response = await axiosPublic.post(`/api/prescription`, prescriptionData);
            console.log('Prescription saved:', response.data);
            refetch();

            Swal.fire("সফল!", "প্রেসক্রিপশন সফলভাবে সংরক্ষিত হয়েছে।", "success");
            navigate(`/dashboardDoctor/appointmentDetailsDoctor/${appointmentId}`);
        } catch (err) {
            console.error("Error saving prescription:", err);
            const errorMessage = err.response?.data?.message || "প্রেসক্রিপশন সংরক্ষণে ত্রুটি হয়েছে।";
            Swal.fire("ত্রুটি!", errorMessage, "error");
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
        <div className="mx-auto p-12 bg-white shadow-lg rounded-md">
            <h2 className="text-2xl font-semibold mb-4">প্রেসক্রিপশন তৈরি করুন</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700">রোগীর নাম</label>
                    <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="mt-2 p-2 w-full border rounded-md"
                        required
                    />
                </div>

                <div className="mb-4 flex space-x-4">
                    <div className="w-1/2">
                        <label className="block text-gray-700">জেন্ডার</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="mt-2 p-2 w-full border rounded-md"
                        >
                            <option value="">জেন্ডার নির্বাচন করুন</option>
                            <option value="male">পুরুষ</option>
                            <option value="female">মহিলা</option>
                            <option value="other">অন্যান্য</option>
                        </select>
                    </div>

                    <div className="w-1/2">
                        <label className="block text-gray-700">বয়স</label>
                        <input
                            type="number"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            className="mt-2 p-2 w-full border rounded-md"
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">রোগ নির্ণয়</label>
                    <textarea
                        value={chiefComplaints}
                        onChange={(e) => setChiefComplaints(e.target.value)}
                        className="mt-2 p-2 w-full border rounded-md"
                        placeholder='রোগীর রোগ নির্ণয় লিখুন...'
                        rows="3"
                        required
                    />
                </div>

                <div className="mb-4">
                    <h3 className="text-lg  mb-2 font-semibold">ঔষধ</h3>
                    {medications.map((medication, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex space-x-4">
                                <div className='w-full'>
                                     <label className="block text-gray-700">ঔষধের নাম</label>
                                <input
                                    type="text"
                                    placeholder="ঔষধের নাম লিখুন..."
                                    value={medication.name}
                                    onChange={(e) => handleInputChange(e, index, 'name')}
                                    className="p-2 w-full border rounded-md"
                                    required
                                />
                                </div>
                                <div className='w-full'>
                                    <label className="block text-gray-700">ডোজ</label>
                                <input
                                    type="text"
                                    placeholder="1+0+1 এইভাবে লিখুন..."
                                    value={medication.dosage}
                                    onChange={(e) => handleInputChange(e, index, 'dosage')}
                                    className="p-2 w-full border rounded-md"
                                    
                                />
                                </div>
                            </div>

                            <div className="flex space-x-4 mt-2">
                                 
                                   <div className='w-full'>
                                     <label className="block text-gray-700">নির্দেশনা</label>
                                  
                                <input
                                    type="text"
                                    placeholder="ব্যবহারের নিয়ম লিখুন..."
                                    value={medication.instructions}
                                    onChange={(e) => handleInputChange(e, index, 'instructions')}
                                    className="p-2 w-full border rounded-md"
                                    
                                />
                                   </div>
                               <div className='w-full'>
                                    <label className="block text-gray-700">সময়কাল</label>
                                <input
                                    type="text"
                                    placeholder="7 days..."
                                    value={medication.duration}
                                    onChange={(e) => handleInputChange(e, index, 'duration')}
                                    className="p-2 w-full border rounded-md"
                                    
                                />
                               </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => handleRemoveMedication(index)}
                                className="mt-2 text-red-500 bg-gray-200 px-3 py-1 rounded-md"
                            >
                                - ঔষধ মুছে ফেলুন
                            </button>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={handleAddMedication}
                        className="mt-2 text-blue-500 bg-gray-200 px-3 py-1 rounded-md"
                    >
                        + নতুন ঔষধ যোগ করুন
                    </button>
                </div>

                {/* New Test Field */}
                <div className="mb-4">
                    <label className="block text-gray-700">পরীক্ষা</label>
                    <input
                        type="text"
                        value={tests}
                        onChange={(e) => setTests(e.target.value)}
                        className="mt-2 p-2 w-full border rounded-md"
                        placeholder="যে পরীক্ষাগুলি করতে হবে"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">ফলো-আপ</label>
                    <input
                        type="text"
                        value={followUp}
                        onChange={(e) => setFollowUp(e.target.value)}
                        className="mt-2 p-2 w-full border rounded-md"
                        placeholder='ফলো-আপ তারিখ বা নির্দেশনা দিন...'
                        
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700">পরামর্শ</label>
                    <textarea
                        value={advice}
                        onChange={(e) => setAdvice(e.target.value)}
                        className="mt-2 p-2 w-full border rounded-md"
                        placeholder='রোগীকে প্রদত্ত পরামর্শ লিখুন...'
                        rows="3"
                       
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded-md"
                    disabled={loading}
                >
                    {loading ? 'প্রেসক্রিপশন জমা দেওয়া হচ্ছে...' : 'প্রেসক্রিপশন জমা দিন'}
                </button>
            </form>
        </div>
    );
};

export default CreatePrescription;
