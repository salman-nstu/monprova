import React from 'react';

const AssessmentCard = ({ assessment, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200 hover:border-primary-color"
        >
            <div className="flex items-center gap-4">
                <div className="text-4xl">{assessment.icon}</div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{assessment.title}</h3>
                    <p className="text-sm text-gray-600">{assessment.subtitle}</p>
                    <p className="text-xs text-gray-500 mt-2">⏱️ {assessment.duration}</p>
                </div>
            </div>
            <p className="text-gray-700 mt-4 text-sm">{assessment.description}</p>
            <button className="mt-4 w-full bg-primary-color text-white py-2 rounded-lg hover:bg-primary-color transition">
                শুরু করুন
            </button>
        </div>
    );
};

export default AssessmentCard;
