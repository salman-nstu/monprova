import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentConfig, calculateScore, getSeverityLevel } from '../../assessmentConfig';
import QuestionComponent from '../../components/assessment/QuestionComponent';
import useAssessment from '../../hooks/useAssessment';
import useAuth from '../../hooks/useAuth';
import usePatient from '../../hooks/usePatient';

const AssessmentForm = () => {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [patients] = usePatient();
    const { createAssessment, isCreating } = useAssessment();

    const assessment = Object.values(assessmentConfig).find(a => a.id === assessmentId);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [duplicateMessage, setDuplicateMessage] = useState('');

    // Debug logging
    console.log('Assessment ID from URL:', assessmentId);
    console.log('Found assessment:', assessment);
    console.log('Available assessments:', Object.values(assessmentConfig).map(a => a.id));

    if (!assessment) {
        return (
            <div className="min-h-[850px] bg-[#E1ECFF] rounded-lg mt-16 p-10">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">মূল্যায়ন পাওয়া যায়নি</h2>
                    <p className="text-gray-600 mt-2">Assessment ID: {assessmentId}</p>
                </div>
            </div>
        );
    }

    // Redirect legacy form route to the new per-question pages (start at question 1)
    // Keeps backward compatibility with existing links
    navigate(`/dashboardPatient/assessment/${assessment.id}/q/1`, { replace: true });
    return null;

    const currentQuestion = assessment.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id];

    const handleAnswerChange = (option) => {
        setAnswers({
            ...answers,
            [currentQuestion.id]: option
        });
    };

    const handleNext = () => {
        if (currentQuestionIndex < assessment.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = async () => {
        // Verify assessment exists
        if (!assessment) {
            alert('মূল্যায়ন খুঁজে পাওয়া যায়নি');
            return;
        }

        // Check if all questions are answered
        if (Object.keys(answers).length !== assessment.questions.length) {
            alert('দয়া করে সমস্ত প্রশ্নের উত্তর দিন');
            return;
        }

        setIsSubmitting(true);

        try {
            const patient = patients?.find(p => p.email === user?.email);
            
            // Debug logs
            console.log('Patient found:', patient);
            console.log('User email:', user?.email);
            console.log('Assessment:', assessment);
            
            const answerArray = assessment.questions.map(q => answers[q.id]);
            console.log('Answer array:', answerArray);
            
            // Find the config key (PHQ-9, GAD-7, PSS-10) from the assessmentConfig
            const configKey = Object.keys(assessmentConfig).find(key => 
                assessmentConfig[key].id === assessmentId
            );
            console.log('Config key:', configKey);
            
            const score = calculateScore(configKey, answerArray);
            console.log('Calculated score:', score);
            
            const severity = getSeverityLevel(configKey, score);
            console.log('Severity:', severity);

            const assessmentData = {
                patientID: patient?._id || 'unknown',
                patientEmail: user?.email,
                assessmentType: assessment.title,
                assessmentId: assessment.id,
                date: new Date().toISOString(),
                answers: answerArray.map((answer, index) => ({
                    questionId: assessment.questions[index].id,
                    questionText: assessment.questions[index].text,
                    answer: answer
                })),
                score,
                severity: severity.label,
                severityBangla: severity.bangla,
                maxScore: assessment.maxScore
            };

            console.log('Submitting assessment data:', assessmentData);
            const result = await createAssessment(assessmentData);
            console.log('Assessment created successfully:', result);
            
            navigate(`/dashboardPatient/assessment/${assessment.id}/results`, {
                state: {
                    score,
                    severity,
                    assessment
                }
            });
        } catch (error) {
            console.error('Error submitting assessment:', error);
            console.error('Error details:', error.response?.data);
            console.error('Full error object:', JSON.stringify(error, null, 2));
            const apiMessage = error.response?.data?.message;
            if (error.response?.status === 409) {
                setDuplicateMessage(apiMessage || 'আপনি আজ এই মূল্যায়নটি আগে সম্পন্ন করেছেন');
            } else {
                alert(`মূল্যায়ন জমা দিতে ত্রুটি হয়েছে: ${apiMessage || error.message}`);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isAnswered = Object.keys(answers).length === assessment.questions.length;

    return (
        <div className="min-h-[850px] bg-[#E1ECFF] rounded-lg mt-0 p-10">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">
                        {assessment.title}
                    </h2>
                    <p className="text-center text-gray-600">
                        {assessment.subtitle}
                    </p>
                </div>

                {duplicateMessage && (
                    <div className="mb-6 bg-gradient-to-r from-amber-100 via-yellow-50 to-white border border-amber-200 text-amber-800 rounded-lg p-4 shadow-sm flex items-start gap-3">
                        <span className="text-xl">⚠️</span>
                        <div className="flex-1">
                            <p className="font-semibold">আজকের সীমা পূর্ণ</p>
                            <p className="text-sm leading-relaxed">{duplicateMessage}</p>
                        </div>
                        <button
                            onClick={() => setDuplicateMessage('')}
                            className="text-amber-700 hover:text-amber-900 font-semibold"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <QuestionComponent
                    question={currentQuestion}
                    currentAnswer={currentAnswer}
                    onAnswerChange={handleAnswerChange}
                    questionNumber={currentQuestionIndex + 1}
                    totalQuestions={assessment.questions.length}
                />

                <div className="flex justify-between gap-4 mt-8">
                    <button
                        onClick={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className="py-3 px-6 bg-primary-color text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        ← পূর্ববর্তী
                    </button>

                    <button
                        onClick={() => navigate('/dashboardPatient/assessment')}
                        className="py-3 px-6 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition flex items-center gap-2"
                    >
                        <span>✕</span>
                        <span>বাতিল করুন</span>
                    </button>

                    {currentQuestionIndex === assessment.questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!isAnswered || isSubmitting}
                            className="py-3 px-6 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? 'জমা দিচ্ছেন...' : 'জমা দিন'}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!currentAnswer}
                            className="py-3 px-6 bg-primary-color text-white rounded-lg font-semibold hover:bg-primary-color disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            পরবর্তী →
                        </button>
                    )}
                </div>

                <div className="mt-6 p-4 bg-white rounded-lg text-sm text-gray-600">
                    <p>
                        {Object.keys(answers).length} of {assessment.questions.length} প্রশ্নের উত্তর দিয়েছেন
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssessmentForm;
