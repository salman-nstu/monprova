import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentConfig, calculateScore, getSeverityLevel } from '../../assessmentConfig';
import QuestionComponent from '../../components/assessment/QuestionComponent';
import useAssessment from '../../hooks/useAssessment';
import useAuth from '../../hooks/useAuth';
import usePatient from '../../hooks/usePatient';

const storageKey = (assessmentId) => `assessment_answers_${assessmentId}`;

const AssessmentQuestionPage = () => {
  const { assessmentId, qIndex } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients] = usePatient();
  const { createAssessment, isCreating } = useAssessment();

  const assessment = useMemo(() => (
    Object.values(assessmentConfig).find(a => a.id === assessmentId)
  ), [assessmentId]);

  const totalQuestions = assessment?.questions?.length || 0;
  const index = Math.max(1, Math.min(Number(qIndex || 1), totalQuestions));

  const [answers, setAnswers] = useState({});
  const currentQuestion = assessment?.questions?.[index - 1];

  useEffect(() => {
    if (!assessment) return;
    try {
      const saved = window.localStorage.getItem(storageKey(assessmentId));
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    } catch (e) {
      // ignore storage errors
    }
  }, [assessmentId, assessment]);

  useEffect(() => {
    if (!assessment) return;
    try {
      window.localStorage.setItem(storageKey(assessmentId), JSON.stringify(answers));
    } catch (e) {
      // ignore storage errors
    }
  }, [answers, assessmentId, assessment]);

  if (!assessment) {
    return (
      <div className="min-h-[850px] bg-[#E1ECFF] rounded-lg mt-0 p-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">মূল্যায়ন পাওয়া যায়নি</h2>
          <p className="text-gray-600 mt-2">Assessment ID: {assessmentId}</p>
        </div>
      </div>
    );
  }

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const onAnswerChange = (option) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  };

  const goTo = (nextIndex) => {
    navigate(`/dashboardPatient/assessment/${assessment.id}/q/${nextIndex}`);
  };

  const handleNext = () => {
    if (index < totalQuestions) {
      goTo(index + 1);
    }
  };

  const handlePrevious = () => {
    if (index > 1) {
      goTo(index - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    if (Object.keys(answers).length !== totalQuestions) {
      alert('দয়া করে সমস্ত প্রশ্নের উত্তর দিন');
      return;
    }

    try {
      const patient = patients?.find(p => p.email === user?.email);

      const answerArray = assessment.questions.map(q => answers[q.id]);
      const configKey = Object.keys(assessmentConfig).find(key => assessmentConfig[key].id === assessmentId);
      const score = calculateScore(configKey, answerArray);
      const severity = getSeverityLevel(configKey, score);

      const assessmentData = {
        patientID: patient?._id || 'unknown',
        patientEmail: user?.email,
        assessmentType: assessment.title,
        assessmentId: assessment.id,
        date: new Date().toISOString(),
        answers: answerArray.map((answer, idx) => ({
          questionId: assessment.questions[idx].id,
          questionText: assessment.questions[idx].text,
          answer
        })),
        score,
        severity: severity.label,
        severityBangla: severity.bangla,
        maxScore: assessment.maxScore
      };

      await createAssessment(assessmentData);

      // clear local progress
      try { window.localStorage.removeItem(storageKey(assessment.id)); } catch (e) {}

      navigate(`/dashboardPatient/assessment/${assessment.id}/results`, {
        state: { score, severity, assessment }
      });
    } catch (error) {
      const apiMessage = error?.response?.data?.message;
      if (error?.response?.status === 409) {
        alert(apiMessage || 'আপনি আজ এই মূল্যায়নটি আগে সম্পন্ন করেছেন');
      } else {
        alert(`মূল্যায়ন জমা দিতে ত্রুটি হয়েছে: ${apiMessage || error.message}`);
      }
    }
  };

  const isLast = index === totalQuestions;

  return (
    <div className="min-h-[850px] bg-[#E1ECFF] rounded-lg mt-16 p-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">{assessment.title}</h2>
          <p className="text-center text-gray-600">{assessment.subtitle}</p>
        </div>

        {currentQuestion && (
          <QuestionComponent
            question={currentQuestion}
            currentAnswer={currentAnswer}
            onAnswerChange={onAnswerChange}
            questionNumber={index}
            totalQuestions={totalQuestions}
          />
        )}

        <div className="flex justify-between gap-4 mt-8">
          <button
            onClick={handlePrevious}
            disabled={index === 1}
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

          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={!currentAnswer || isCreating}
              className="py-3 px-6 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isCreating ? 'জমা দিচ্ছেন...' : 'জমা দিন'}
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
          <p>{Object.keys(answers).length} of {totalQuestions} প্রশ্নের উত্তর দিয়েছেন</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentQuestionPage;
