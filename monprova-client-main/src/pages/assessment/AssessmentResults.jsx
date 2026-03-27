import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AssessmentResults = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { score, severity, assessment } = location.state || {};

    if (!score || !severity || !assessment) {
        return (
            <div className="min-h-[850px] bg-[#E1ECFF] rounded-lg mt-16 p-10">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">ফলাফল পাওয়া যায়নি</h2>
                </div>
            </div>
        );
    }

    const scorePercentage = (score / assessment.maxScore) * 100;

    return (
        <div className="min-h-[850px] bg-[#E1ECFF] rounded-lg mt-16 p-10">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">
                            আপনার ফলাফল
                        </h2>
                        <p className="text-gray-600">{assessment.title}</p>
                    </div>

                    <div className={`${severity.color} rounded-lg p-8 mb-8 text-center`}>
                        <p className="text-gray-600 text-sm mb-2">আপনার স্কোর</p>
                        <p className="text-5xl font-bold text-primary-color mb-4">
                            {score} / {assessment.maxScore}
                        </p>
                        <div className="w-full bg-gray-300 rounded-full h-3 mb-4">
                            <div
                                className="bg-primary-color h-3 rounded-full transition-all"
                                style={{ width: `${scorePercentage}%` }}
                            ></div>
                        </div>
                        <p className="text-lg font-semibold text-gray-800">
                            {severity.bangla}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                            ({severity.label})
                        </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-primary-color p-6 mb-8">
                        <h3 className="font-bold text-gray-800 mb-2">
                            📌 আপনার ফলাফল সম্পর্কে
                        </h3>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            এই স্কোর আপনার বর্তমান মানসিক অবস্থার একটি স্ন্যাপশট। এটি একটি চিকিৎসা নির্ণয় নয়।
                            আপনার ফলাফল সম্পর্কে আরও জানতে এবং সহায়তা পেতে আপনার ডাক্তারের সাথে পরামর্শ করুন।
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/dashboardPatient/assessment')}
                            className="w-full py-3 px-6 bg-primary-color text-white rounded-lg font-semibold hover:bg-primary-color transition"
                        >
                            অন্য মূল্যায়ন নিন
                        </button>
                        <button
                            onClick={() => navigate('/dashboardPatient')}
                            className="w-full py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
                        >
                            ড্যাশবোর্ডে ফিরুন
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        💡 সুপারিশ
                    </h3>
                    <ul className="space-y-2 text-gray-700 text-sm">
                        <li className="flex items-start gap-3">
                            <span className="text-primary-color">✓</span>
                            <span>নিয়মিত মূল্যায়ন নিয়ে আপনার অগ্রগতি ট্র্যাক করুন</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary-color">✓</span>
                            <span>এই ফলাফল আপনার ডাক্তারের সাথে শেয়ার করুন</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary-color">✓</span>
                            <span>আমাদের ব্লগ এবং ভিডিও সামগ্রী অন্বেষণ করুন</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary-color">✓</span>
                            <span>প্রয়োজনে পেশাদার সহায়তা চাইতে দ্বিধা করবেন না</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AssessmentResults;
