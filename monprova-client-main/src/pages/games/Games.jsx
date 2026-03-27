import React from 'react';
import { useNavigate } from 'react-router-dom';

const Games = () => {
    const navigate = useNavigate();

    const games = [
        {
            id: 'breathing',
            title: 'শ্বাস-প্রশ্বাসের ব্যায়াম',
            subtitle: 'গভীর শ্বাস নিয়ে শান্ত হন',
            icon: '🫁',
            color: 'from-blue-400 to-cyan-500',
            borderColor: 'border-blue-400',
            description: 'একটি সহজ শ্বাস-প্রশ্বাসের ব্যায়াম যা আপনাকে শিথিল করতে সাহায্য করবে',
            route: '/dashboardPatient/games/breathing'
        },
        {
            id: 'colour',
            title: 'ব্লক রঙ করুন',
            subtitle: 'মজার রঙিন খেলা',
            icon: '🎨',
            color: 'from-pink-400 to-purple-500',
            borderColor: 'border-pink-400',
            description: 'ব্লকগুলিতে রঙ ভরে আপনার সৃজনশীলতা প্রকাশ করুন',
            route: '/dashboardPatient/games/colour'
        },
        {
            id: 'balloon',
            title: 'বেলুন ফাটান',
            subtitle: 'দ্রুততার খেলা',
            icon: '🎈',
            color: 'from-orange-400 to-red-500',
            borderColor: 'border-orange-400',
            description: 'উড়ন্ত বেলুনগুলি ফাটিয়ে আপনার প্রতিক্রিয়া পরীক্ষা করুন',
            route: '/dashboardPatient/games/balloon'
        }
    ];

    const handleGameClick = (route) => {
        navigate(route);
    };

    return (
        <div className="h-[calc(100vh-80px)] bg-[#E1ECFF] rounded-lg mt-0 p-4 overflow-auto">
            <div className="">
                <div className="text-center mb-6 p-4">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🎮 মানসিক স্বাস্থ্য গেমস
                    </h1>
                    <p className="text-base text-gray-600">
                        খেলার মাধ্যমে আপনার মানসিক স্বাস্থ্য উন্নত করুন
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4">
                    {games.map((game) => (
                        <div
                            key={game.id}
                            onClick={() => handleGameClick(game.route)}
                            className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-3 ${game.borderColor} overflow-hidden`}
                        >
                            <div className={`bg-gradient-to-br ${game.color} p-6 text-center`}>
                                <div className="text-5xl mb-3">{game.icon}</div>
                                <h2 className="text-xl font-bold text-white mb-1">
                                    {game.title}
                                </h2>
                                <p className="text-sm text-white text-opacity-90">
                                    {game.subtitle}
                                </p>
                            </div>
                            <div className="p-4">
                                <p className="text-sm text-gray-700 text-center leading-relaxed mb-3">
                                    {game.description}
                                </p>
                                <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md block mx-auto">
                                    খেলা শুরু করুন
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl mx-4 p-4 py-8 border border-blue-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                        💡 কেন খেলা গুরুত্বপূর্ণ?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <div className="text-3xl mb-2 text-center">😌</div>
                            <h4 className="font-semibold text-gray-800 mb-1 text-center">মানসিক চাপ কমায়</h4>
                            <p className="text-sm text-gray-600 text-center">খেলা আপনার মনকে বিশ্রাম দেয় এবং চাপ কমায়</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <div className="text-3xl mb-2 text-center">🧠</div>
                            <h4 className="font-semibold text-gray-800 mb-1 text-center">মনোযোগ বাড়ায়</h4>
                            <p className="text-sm text-gray-600 text-center">নিয়মিত খেলা মনোযোগ এবং একাগ্রতা উন্নত করে</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-md">
                            <div className="text-3xl mb-2 text-center">😊</div>
                            <h4 className="font-semibold text-gray-800 mb-1 text-center">মেজাজ ভালো করে</h4>
                            <p className="text-sm text-gray-600 text-center">খেলা আনন্দদায়ক হরমোন নিঃসরণ করে</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Games;
