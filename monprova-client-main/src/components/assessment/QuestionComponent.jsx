import React from 'react';

const QuestionComponent = ({ question, currentAnswer, onAnswerChange, questionNumber, totalQuestions }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-800">
                    Question {questionNumber} of {totalQuestions}
                </h3>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-primary-color h-2 rounded-full transition-all"
                        style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    ></div>
                </div>
            </div>

            <div className="mb-8">
                <p className="text-xl text-gray-800 font-semibold mb-2">{question.text}</p>
                {question.bangla && (
                    <p className="text-lg text-gray-700">{question.bangla}</p>
                )}
            </div>

            <div className="space-y-3">
                {question.options.map((option) => (
                    <label
                        key={option.value}
                        className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-color hover:bg-blue-50 transition"
                    >
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={option.value}
                            checked={currentAnswer?.value === option.value}
                            onChange={() => onAnswerChange(option)}
                            className="w-4 h-4 text-primary-color"
                        />
                        <div className="ml-4">
                            <p className="text-gray-800 font-medium">{option.label}</p>
                            <p className="text-sm text-gray-600">{option.text}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default QuestionComponent;
