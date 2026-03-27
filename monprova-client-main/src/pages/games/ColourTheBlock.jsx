import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const palette = ['#2563EB', '#F97316', '#10B981', '#EC4899', '#8B5CF6', '#F59E0B', '#0EA5E9', '#EF4444'];
const colorNames = {
    '#2563EB': 'নীল',
    '#F97316': 'কমলা',
    '#10B981': 'সবুজ',
    '#EC4899': 'গোলাপি',
    '#8B5CF6': 'বেগুনি',
    '#F59E0B': 'হলুদাভ',
    '#0EA5E9': 'আকাশী',
    '#EF4444': 'লাল',
};
const stamps = ['🦊', '🐱', '🐶', '🐼', '🐘', '🦁', '🦉', '🦜', '🐧', '🦋', '🐦', '🌳', '🌲', '🌴', '🌸', '🌼'];
const emptyColor = '#E5E7EB';
const gridSize = 16;

const ColourTheBlock = () => {
    const navigate = useNavigate();
    const [selectedColor, setSelectedColor] = useState(palette[0]);
    const [cells, setCells] = useState(() => Array.from({ length: gridSize }, () => ({ color: emptyColor, stamp: null })));

    const filledCount = useMemo(
        () => cells.filter((cell) => cell.color !== emptyColor || cell.stamp).length,
        [cells]
    );

    const handleCellClick = (index) => {
        setCells((prev) => {
            const next = [...prev];
            next[index] = {
                color: selectedColor,
                stamp: stamps[Math.floor(Math.random() * stamps.length)],
            };
            return next;
        });
    };

    const handleClear = () => {
        setCells(Array.from({ length: gridSize }, () => ({ color: emptyColor, stamp: null })));
    };

    const handleRandomFill = () => {
        setCells(
            Array.from({ length: gridSize }, () => ({
                color: palette[Math.floor(Math.random() * palette.length)],
                stamp: stamps[Math.floor(Math.random() * stamps.length)],
            }))
        );
    };

    return (
        <div className="h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-lg mt-4 p-6 overflow-hidden">
            <div className="max-w-6xl mx-auto h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={() => navigate('/dashboardPatient/games')}
                        className="px-6 py-3 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md flex items-center gap-2"
                    >
                        <span>←</span>
                        <span>ফিরে যান</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-800">🎨 ব্লক রঙ করুন</h1>
                    <div className="w-32"></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-auto">
                    <div className="bg-white rounded-xl shadow-2xl p-4">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <p className="text-sm text-gray-500">নির্বাচিত রঙ</p>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="w-10 h-10 rounded-full border border-gray-200" style={{ backgroundColor: selectedColor }}></span>
                                    <span className="font-semibold text-gray-800">{colorNames[selectedColor] || 'Custom'}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRandomFill}
                                    className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-blue-700 transition shadow"
                                >
                                    র‍্যান্ডম প্যাটার্ন
                                </button>
                                <button
                                    onClick={handleClear}
                                    className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition shadow"
                                >
                                    সব মুছুন
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                            {cells.map((cell, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCellClick(index)}
                                    className="relative w-full aspect-square rounded-md border-2 border-gray-200 hover:border-indigo-400 transition"
                                    style={{ backgroundColor: cell.color }}
                                    aria-label={`cell-${index}`}
                                >
                                    {cell.stamp && (
                                        <span className="absolute inset-0 flex items-center justify-center text-2xl">
                                            {cell.stamp}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col h-full gap-2">
                        <div className="bg-white rounded-xl shadow-xl p-3">
                            <p className="text-xs text-gray-500 mb-2">রঙের প্যালেট</p>
                            <div className="grid grid-cols-4 gap-2 max-w-[180px]">
                                {palette.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-full aspect-square rounded-md border-2 transition ${selectedColor === color ? 'border-indigo-600 scale-105' : 'border-transparent'} shadow`}
                                        style={{ backgroundColor: color }}
                                        aria-label={`select-${color}`}
                                    />
                                ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-600">একটি রঙ বেছে নিয়ে ব্লকে ক্লিক করুন</p>
                        </div>

                        <div className="bg-white rounded-xl shadow-xl p-3 flex-1 flex flex-col justify-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-3">কিভাবে খেলবেন</h3>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li>• একটি পছন্দের রঙ নির্বাচন করুন।</li>
                                <li>• গ্রিডের ব্লকে ক্লিক করলে রঙের সঙ্গে একটি প্রাণী/পাখি/গাছের স্টিকার বসবে।</li>
                                <li>• র‍্যান্ডম প্যাটার্ন বাটনে চাপলে পুরো গ্রিডে মিশ্র স্টিকার ও রঙ ভরে যাবে।</li>
                                <li>• সব মুছুন বাটনে ক্লিক করে আবার শুরু করুন।</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl shadow-xl p-3">
                            <h3 className="text-sm font-bold text-gray-800 mb-2">অগ্রগতি</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>মোট ব্লক</span>
                                    <span>{gridSize}</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-600">
                                    <span>রঙ করা হয়েছে</span>
                                    <span className="font-semibold text-indigo-600">{filledCount}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500"
                                        style={{ width: `${Math.round((filledCount / gridSize) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColourTheBlock;
