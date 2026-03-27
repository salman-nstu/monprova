import React, { useState, useEffect } from 'react';
import PageCover from '../shared/PageCover';
import DoctorCard from '../../components/cards/DoctorCard';
import useDoctor from '../../hooks/useDoctor';

const DoctorList = () => {
    const [doctors] = useDoctor();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDivision, setSelectedDivision] = useState('');
    const [selectedSpecialist, setSelectedSpecialist] = useState('');
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [showStatus, setShowStatus] = useState('both');  // 'both', 'online', 'offline'

    // Division mapping English -> Bangla
    const divisionMapping = {
        'Dhaka': 'ঢাকা',
        'Chattogram': 'চট্টগ্রাম',
        'Khulna': 'খুলনা',
        'Rajshahi': 'রাজশাহী',
        'Barishal': 'বরিশাল',
        'Sylhet': 'সিলেট',
        'Rangpur': 'রংপুর',
        'Mymensingh': 'ময়মনসিংহ',
    };

    // Specialist mapping English -> Bangla
    const specialistMapping = {
        'psychologist': 'সাইকোলজিস্ট',
        'psychiatrist': 'সাইকিয়াট্রিস্ট',
    };

    const divisions = Object.keys(divisionMapping);
    const specialists = Object.keys(specialistMapping);

    const filterDoctors = () => {
        let results = doctors;

        results = results.filter(d => d.verificationStatus === 'verified');

        if (searchQuery) {
            results = results.filter(d =>
                Object.values(d).some(value =>
                    value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        }

        if (selectedDivision) {
            results = results.filter(d =>
                d.division?.toLowerCase() === selectedDivision.toLowerCase()
            );
        }

        if (selectedSpecialist) {
            results = results.filter(d => {
                const doctorSpecialist = d.specialist?.toLowerCase()?.trim();
                const filterSpecialist = selectedSpecialist.toLowerCase().trim();
                return doctorSpecialist === filterSpecialist;
            });
        }

        // Filter by medium: online shows 'online' and 'both', offline shows 'offline' and 'both'
        if (showStatus === 'online') {
            results = results.filter(d => d.medium === 'online' || d.medium === 'both');
        } else if (showStatus === 'offline') {
            results = results.filter(d => d.medium === 'offline' || d.medium === 'both');
        }

        setFilteredDoctors(results);
    };

    useEffect(() => {
        filterDoctors();
    }, [searchQuery, selectedDivision, selectedSpecialist, showStatus, doctors]);

    const handleReset = () => {
        setSearchQuery('');
        setSelectedDivision('');
        setSelectedSpecialist('');
        setShowStatus('both');
    };

    return (
        <div>
            <PageCover 
                coverTitle="আমাদের বিশেষজ্ঞ ডাক্তারগণ" 
                coverSubtitle="আপনার স্বাস্থ্যের জন্য আমাদের ডাক্তারদের নির্ভুল পরিচিতি" 
                coverImg="https://i.ibb.co/Z6bp254P/medium-shot-scientists-posing-together.jpg" 
            />

            {/* Search & Filters */}
            <div className="my-8 text-center flex flex-col md:flex-row items-center justify-center gap-3 flex-wrap">
                <input
                    type="text"
                    placeholder="ডাক্তার খুঁজুন..."
                    className="border-2 border-blue-300 bg-blue-50 placeholder-blue-400 px-4 py-3 rounded-lg w-full md:w-96 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:bg-blue-100 transition-colors duration-300"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="px-4 py-2 border rounded"
                >
                    <option value="">সব বিভাগ</option>
                    {divisions.map(div => (
                        <option key={div} value={div}>
                            {divisionMapping[div]}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedSpecialist}
                    onChange={(e) => setSelectedSpecialist(e.target.value)}
                    className="px-4 py-2 border rounded"
                >
                    <option value="">সব বিশেষজ্ঞ</option>
                    {specialists.map(spec => (
                        <option key={spec} value={spec}>
                            {specialistMapping[spec]}
                        </option>
                    ))}
                </select>
            </div>

            {/* Status Buttons + Reset */}
            <div className="text-center mb-6 space-x-2">
                <button
                    onClick={() => setShowStatus('both')}
                    className={`px-4 py-2 rounded ${showStatus==='both'?'bg-blue-500 text-white':'bg-gray-300'}`}
                >
                    সব ডাক্তার
                </button>
                <button
                    onClick={() => setShowStatus('online')}
                    className={`px-4 py-2 rounded ${showStatus==='online'?'bg-blue-500 text-white':'bg-gray-300'}`}
                >
                    অনলাইন
                </button>
                <button
                    onClick={() => setShowStatus('offline')}
                    className={`px-4 py-2 rounded ${showStatus==='offline'?'bg-blue-500 text-white':'bg-gray-300'}`}
                >
                    অফলাইন
                </button>

                <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-500 text-white rounded ml-4"
                >
                    রিসেট
                </button>
            </div>

            {/* Doctor Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-8 mx-auto px-4 mt-8">
                {filteredDoctors.length > 0 ? (
                    filteredDoctors.map(doc => (
                        <DoctorCard key={doc.id} doctor={doc} />
                    ))
                ) : (
                    <p className="text-center col-span-full">কোনো ডাক্তার পাওয়া যায়নি।</p>
                )}
            </div>
        </div>
    );
};

export default DoctorList;
