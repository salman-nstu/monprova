import React, { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useAxiosPublic from '../../hooks/useAxiosPublic';

const VerificationRequests = () => {
    const axiosPublic = useAxiosPublic();
    const [verificationRequests, setVerificationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('pending'); // 'all', 'pending', 'verified', 'rejected'

    useEffect(() => {
        fetchVerificationRequests();
    }, [filterStatus]);

    const fetchVerificationRequests = async () => {
        try {
            setLoading(true);
            let response;
            
            console.log('Fetching with filterStatus:', filterStatus);
            
            if (filterStatus === 'all') {
                console.log('Calling: /api/doctors/all-verification-requests');
                response = await axiosPublic.get('/api/doctors/all-verification-requests');
            } else {
                console.log(`Calling: /api/doctors/verification-requests?status=${filterStatus}`);
                response = await axiosPublic.get(`/api/doctors/verification-requests?status=${filterStatus}`);
            }

            console.log('API Response:', response.data);
            console.log('Data array:', response.data.data);
            console.log('Data length:', response.data.data?.length);

            if (response.data.success) {
                const requests = response.data.data || [];
                console.log(`Setting ${requests.length} verification requests`);
                setVerificationRequests(requests);
                
                if (requests.length === 0) {
                    console.log('No requests found for status:', filterStatus);
                }
            } else {
                console.warn('API returned success: false');
                setVerificationRequests([]);
            }
        } catch (error) {
            console.error('Error fetching verification requests:', error);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response);
            console.error('Error response data:', error.response?.data);
            console.error('Error response status:', error.response?.status);
            
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: `ভেরিফিকেশন রিকুয়েস্ট লোড করা যায়নি। ${error.response?.data?.message || error.message}`,
                confirmButtonText: 'ঠিক আছে',
                confirmButtonColor: '#ef4444',
            });
            setVerificationRequests([]);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (doctor) => {
        setSelectedDoctor(doctor);
        setShowModal(true);
    };

    const handleVerifyDoctor = async (doctorId) => {
        const confirmResult = await Swal.fire({
            title: 'ডাক্তার ভেরিফাই করুন',
            text: 'আপনি কি এই ডাক্তারকে ভেরিফাই করতে চান?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'হ্যাঁ, ভেরিফাই করুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#16a34a',
            cancelButtonColor: '#6b7280',
        });

        if (confirmResult.isConfirmed) {
            try {
                Swal.fire({
                    title: 'অনুগ্রহ করে অপেক্ষা করুন',
                    text: 'ডাক্তার ভেরিফাই করা হচ্ছে...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                const response = await axiosPublic.put(`/api/doctors/verify/${doctorId}`, {
                    action: 'verify'
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'ভেরিফাই সম্পন্ন!',
                        text: 'ডাক্তার সফলভাবে ভেরিফাই হয়েছে।',
                        confirmButtonText: 'ঠিক আছে',
                        confirmButtonColor: '#16a34a',
                    });
                    setShowModal(false);
                    fetchVerificationRequests();
                } else {
                    throw new Error(response.data.message || 'Failed to verify doctor');
                }
            } catch (error) {
                console.error('Error verifying doctor:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: error.response?.data?.message || 'ডাক্তার ভেরিফাই করা যায়নি।',
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#ef4444',
                });
            }
        }
    };

    const handleRejectDoctor = async (doctorId) => {
        const { value: rejectionReason } = await Swal.fire({
            title: 'ডাক্তার প্রত্যাখ্যান করুন',
            text: 'প্রত্যাখ্যানের কারণ লিখুন:',
            input: 'textarea',
            inputPlaceholder: 'প্রত্যাখ্যানের কারণ...',
            showCancelButton: true,
            confirmButtonText: 'প্রত্যাখ্যান করুন',
            cancelButtonText: 'বাতিল',
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            inputValidator: (value) => {
                if (!value) {
                    return 'প্রত্যাখ্যানের কারণ আবশ্যক!';
                }
            }
        });

        if (rejectionReason) {
            try {
                Swal.fire({
                    title: 'অনুগ্রহ করে অপেক্ষা করুন',
                    text: 'ডাক্তার প্রত্যাখ্যান করা হচ্ছে...',
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading(),
                });

                const response = await axiosPublic.put(`/api/doctors/verify/${doctorId}`, {
                    action: 'reject',
                    rejectionReason
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'প্রত্যাখ্যান সম্পন্ন!',
                        text: 'ডাক্তার প্রত্যাখ্যান করা হয়েছে।',
                        confirmButtonText: 'ঠিক আছে',
                        confirmButtonColor: '#2563eb',
                    });
                    setShowModal(false);
                    fetchVerificationRequests();
                } else {
                    throw new Error(response.data.message || 'Failed to reject doctor');
                }
            } catch (error) {
                console.error('Error rejecting doctor:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: error.response?.data?.message || 'ডাক্তার প্রত্যাখ্যান করা যায়নি।',
                    confirmButtonText: 'ঠিক আছে',
                    confirmButtonColor: '#ef4444',
                });
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'verified':
                return <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">✓ ভেরিফাইড</span>;
            case 'pending':
                return <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold">⏳ অপেক্ষমাণ</span>;
            case 'rejected':
                return <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-semibold">✗ প্রত্যাখ্যাত</span>;
            default:
                return <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-semibold">○ ভেরিফাইড নয়</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#EFF7FE] p-6">
            <div className="mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">ভেরিফিকেশন রিকুয়েস্ট</h1>

                {/* Filter Buttons */}
                <div className="mb-6 flex gap-3 flex-wrap">
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filterStatus === 'pending' 
                                ? 'bg-yellow-500 text-white' 
                                : 'bg-white text-gray-700 hover:bg-yellow-100'
                        }`}
                    >
                        অপেক্ষমাণ
                    </button>
                    <button
                        onClick={() => setFilterStatus('verified')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filterStatus === 'verified' 
                                ? 'bg-green-500 text-white' 
                                : 'bg-white text-gray-700 hover:bg-green-100'
                        }`}
                    >
                        ভেরিফাইড
                    </button>
                    <button
                        onClick={() => setFilterStatus('rejected')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filterStatus === 'rejected' 
                                ? 'bg-red-500 text-white' 
                                : 'bg-white text-gray-700 hover:bg-red-100'
                        }`}
                    >
                        প্রত্যাখ্যাত
                    </button>
                    <button
                        onClick={() => setFilterStatus('not-verified')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filterStatus === 'not-verified' 
                                ? 'bg-gray-500 text-white' 
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        ভেরিফাইড নয়
                    </button>
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                            filterStatus === 'all' 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-white text-gray-700 hover:bg-blue-100'
                        }`}
                    >
                        সব দেখান
                    </button>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 rounded-full border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">লোড হচ্ছে...</p>
                    </div>
                ) : verificationRequests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <FaHourglassHalf className="mx-auto text-6xl text-gray-400 mb-4" />
                        <p className="text-xl text-gray-600">কোন ভেরিফিকেশন রিকুয়েস্ট নেই</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ছবি
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            নাম
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ইমেইল
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            পদবি
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            স্ট্যাটাস
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            অ্যাকশন
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {verificationRequests.map((doctor) => (
                                        <tr key={doctor._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <img 
                                                    src={doctor.image || 'https://via.placeholder.com/50'} 
                                                    alt={doctor.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{doctor.email}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-600">{doctor.designation || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(doctor.verificationStatus || 'not-verified')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDetails(doctor)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                >
                                                    <FaEye className="inline mr-1" /> বিস্তারিত
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal for Doctor Details */}
                {showModal && selectedDoctor && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">ডাক্তারের বিস্তারিত তথ্য</h2>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Profile Image */}
                                    <div className="col-span-2 flex justify-center">
                                        <img
                                            src={selectedDoctor.image || 'https://via.placeholder.com/150'}
                                            alt={selectedDoctor.name}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                        />
                                    </div>

                                    {/* Doctor Information */}
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">নাম:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">পদবি:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.designation || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">ইমেইল:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">মোবাইল নাম্বার:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.mobileNo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">ডিগ্রি:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.degrees || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">বিশেষ দক্ষতা:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.expertise || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">পরামর্শ ফি:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.consultationFee || 'N/A'} টাকা</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">রেজিস্ট্রেশন নাম্বার:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.regNo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">প্রতিষ্ঠান:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.institute || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">চেম্বার:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.chamber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">বিভাগ:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.division || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">অভিজ্ঞতা:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.yearsOfExperience || 'N/A'} বছর</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">পরামর্শের মাধ্যম:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.medium || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">এনআইডি নাম্বার:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.nidNo || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">বিকাশ নাম্বার:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.bkashAccount || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-semibold">ভেরিফিকেশন স্ট্যাটাস:</p>
                                        <div className="mt-2">{getStatusBadge(selectedDoctor.verificationStatus || 'not-verified')}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600 font-semibold">সংক্ষিপ্ত বায়ো:</p>
                                        <p className="text-lg text-gray-800 mb-3">{selectedDoctor.shortBio || 'N/A'}</p>
                                    </div>

                                    {/* NID Images */}
                                    <div className="col-span-2">
                                        <p className="text-sm text-gray-600 font-semibold mb-3">জাতীয় পরিচয়পত্র (NID):</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedDoctor.nidFront && (
                                                <div className="border rounded-lg overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2">NID সামনের অংশ</p>
                                                    <img 
                                                        src={selectedDoctor.nidFront} 
                                                        alt="NID Front"
                                                        className="w-full h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition"
                                                        onClick={() => window.open(selectedDoctor.nidFront, '_blank')}
                                                    />
                                                </div>
                                            )}
                                            {selectedDoctor.nidBack && (
                                                <div className="border rounded-lg overflow-hidden">
                                                    <p className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2">NID পিছনের অংশ</p>
                                                    <img 
                                                        src={selectedDoctor.nidBack} 
                                                        alt="NID Back"
                                                        className="w-full h-64 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition"
                                                        onClick={() => window.open(selectedDoctor.nidBack, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        {!selectedDoctor.nidFront && !selectedDoctor.nidBack && (
                                            <p className="text-gray-500 italic">কোনো NID ছবি আপলোড করা হয়নি</p>
                                        )}
                                    </div>

                                    {/* Certificates */}
                                    {selectedDoctor.certificates && selectedDoctor.certificates.length > 0 && (
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600 font-semibold mb-3">সার্টিফিকেট ও ডিগ্রি:</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedDoctor.certificates.map((cert, index) => (
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

                                    {/* Rejection Reason if rejected */}
                                    {selectedDoctor.verificationStatus === 'rejected' && selectedDoctor.rejectionReason && (
                                        <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
                                            <p className="text-sm text-red-600 font-semibold mb-2">প্রত্যাখ্যানের কারণ:</p>
                                            <p className="text-gray-800">{selectedDoctor.rejectionReason}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 mt-6">
                                    {selectedDoctor.verificationStatus === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleVerifyDoctor(selectedDoctor._id)}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                                            >
                                                <FaCheck /> ভেরিফাই করুন
                                            </button>
                                            <button
                                                onClick={() => handleRejectDoctor(selectedDoctor._id)}
                                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
                                            >
                                                <FaTimes /> প্রত্যাখ্যান করুন
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
                                    >
                                        বন্ধ করুন
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationRequests;
