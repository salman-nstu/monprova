import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BreathingExercise = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState('ready'); // ready, inhale, hold, exhale
    const [count, setCount] = useState(0);
    const [totalCycles, setTotalCycles] = useState(0);

    const phaseDurations = {
        inhale: 4000,
        hold: 4000,
        exhale: 4000
    };

    useEffect(() => {
        if (!isActive) return;

        let timer;
        if (phase === 'inhale') {
            setCount(4);
            timer = setTimeout(() => setPhase('hold'), phaseDurations.inhale);
        } else if (phase === 'hold') {
            setCount(4);
            timer = setTimeout(() => setPhase('exhale'), phaseDurations.hold);
        } else if (phase === 'exhale') {
            setCount(4);
            timer = setTimeout(() => {
                setTotalCycles(prev => prev + 1);
                setPhase('inhale');
            }, phaseDurations.exhale);
        }

        return () => clearTimeout(timer);
    }, [phase, isActive]);

    useEffect(() => {
        if (!isActive || phase === 'ready') return;
        
        const countTimer = setInterval(() => {
            setCount(prev => prev > 1 ? prev - 1 : prev);
        }, 1000);

        return () => clearInterval(countTimer);
    }, [phase, isActive]);

    const startExercise = () => {
        setIsActive(true);
        setPhase('inhale');
        setTotalCycles(0);
    };

    const stopExercise = () => {
        setIsActive(false);
        setPhase('ready');
        setCount(0);
    };

    const getPhaseText = () => {
        switch (phase) {
            case 'inhale':
                return 'শ্বাস নিন';
            case 'hold':
                return 'ধরে রাখুন';
            case 'exhale':
                return 'ছেড়ে দিন';
            default:
                return 'প্রস্তুত';
        }
    };

    const getCircleSize = () => {
        switch (phase) {
            case 'inhale':
                return 'scale-150';
            case 'hold':
                return 'scale-150';
            case 'exhale':
                return 'scale-75';
            default:
                return 'scale-100';
        }
    };

    return (
        <div className="h-[calc(100vh-80px)] bg-gradient-to-br from-blue-100 via-cyan-50 to-blue-100 rounded-lg mt-4 p-6 overflow-hidden">
            <div className="max-w-4xl mx-auto h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => navigate('/dashboardPatient/games')}
                        className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>ফিরে যান</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">🫁 শ্বাস-প্রশ্বাসের ব্যায়াম</h1>
                    <div className="w-32"></div>
                </div>

                {/* Main Exercise Area */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 flex-1 overflow-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                        <div className="lg:col-span-2 flex flex-col items-center justify-center">
                        {/* Breathing Circle */}
                        <div className="relative w-64 h-64 flex items-center justify-center mb-6">
                            <div
                                className={`absolute w-48 h-48 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full transition-all duration-[4000ms] ease-in-out ${
                                    isActive ? getCircleSize() : 'scale-100'
                                } shadow-2xl`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-white text-5xl font-bold mb-2">
                                            {isActive ? count : '4'}
                                        </div>
                                        <div className="text-white text-xl font-semibold">
                                            {getPhaseText()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="text-center mb-6">
                            <p className="text-lg text-gray-700 mb-3">
                                {isActive
                                    ? 'বৃত্ত অনুসরণ করুন এবং শ্বাস নিয়ন্ত্রণ করুন'
                                    : 'শুরু করতে নিচের বাটনে ক্লিক করুন'}
                            </p>
                            {isActive && (
                                <div className="bg-blue-50 rounded-lg p-4 inline-block">
                                    <p className="text-lg font-semibold text-blue-800">
                                        সম্পূর্ণ চক্র: {totalCycles}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Control Button */}
                        {!isActive ? (
                            <button
                                onClick={startExercise}
                                className="px-10 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-lg font-bold rounded-full hover:from-blue-700 hover:to-cyan-700 transition shadow-lg hover:shadow-xl"
                            >
                                শুরু করুন
                            </button>
                        ) : (
                            <button
                                onClick={stopExercise}
                                className="px-10 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-lg font-bold rounded-full hover:from-red-600 hover:to-pink-600 transition shadow-lg hover:shadow-xl"
                            >
                                বন্ধ করুন
                            </button>
                        )}
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                                📋 কিভাবে খেলবেন
                            </h3>
                            <div className="space-y-4">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">🌬️</div>
                                    <h4 className="font-semibold text-gray-800 mb-2">১. শ্বাস নিন</h4>
                                    <p className="text-sm text-gray-600">বৃত্ত বড় হলে নাক দিয়ে গভীর শ্বাস নিন</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">⏸️</div>
                                    <h4 className="font-semibold text-gray-800 mb-2">২. ধরে রাখুন</h4>
                                    <p className="text-sm text-gray-600">বৃত্ত স্থির থাকলে শ্বাস ধরে রাখুন</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl mb-2">💨</div>
                                    <h4 className="font-semibold text-gray-800 mb-2">৩. ছেড়ে দিন</h4>
                                    <p className="text-sm text-gray-600">বৃত্ত ছোট হলে মুখ দিয়ে শ্বাস ছাড়ুন</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreathingExercise;
