import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAssessment from '../../hooks/useAssessment';
import CombinedAssessmentGraph from '../../components/assessment/CombinedAssessmentGraph';

const AssessmentHistory = () => {
    const navigate = useNavigate();
    const { assessments, isLoading } = useAssessment();

    return (
        <div className="min-h-screen bg-[#E1ECFF] rounded-lg mt-16 p-10">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    আপনার মূল্যায়ন ইতিহাস
                </h2>

                <CombinedAssessmentGraph assessments={assessments} isLoading={isLoading} />

                <div className="mt-12 flex justify-center">
                    <button
                        onClick={() => navigate('/dashboardPatient/assessment')}
                        className="flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition shadow-lg hover:shadow-xl"
                    >
                        <span>← ফিরুন</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentHistory;
