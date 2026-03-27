import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { assessmentConfig, assessmentTypes } from '../../assessmentConfig';

const typeById = Object.entries(assessmentConfig).reduce((acc, [typeKey, config]) => {
    acc[config.id] = typeKey;
    return acc;
}, {});

const lineColors = {
    [assessmentTypes.PHQ9]: '#3b82f6',
    [assessmentTypes.GAD7]: '#10b981',
    [assessmentTypes.PSS10]: '#f59e0b'
};

const testIcons = {
    [assessmentTypes.PHQ9]: '😔',
    [assessmentTypes.GAD7]: '😰',
    [assessmentTypes.PSS10]: '😟'
};

const testLabels = {
    [assessmentTypes.PHQ9]: 'বিষণ্নতা (PHQ-9)',
    [assessmentTypes.GAD7]: 'উদ্বেগ (GAD-7)',
    [assessmentTypes.PSS10]: 'মানসিক চাপ (PSS-10)'
};

const normalizeType = (assessment) => {
    if (assessment?.assessmentId && typeById[assessment.assessmentId]) {
        return typeById[assessment.assessmentId];
    }

    const matched = Object.values(assessmentTypes).find(type => assessment?.assessmentType?.includes(type));
    return matched || null;
};

const CombinedAssessmentGraph = ({ assessments = [], isLoading }) => {
    const timeSeries = useMemo(() => {
        if (!assessments || assessments.length === 0) return [];

        // Calculate dynamic date range based on test dates
        const validAssessments = assessments.filter(item => {
            const dateObj = new Date(item.date);
            return !Number.isNaN(dateObj.getTime());
        });

        if (validAssessments.length === 0) return [];

        const allDates = validAssessments.map(item => new Date(item.date));
        const earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const latestDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        
        // Calculate the span of tests
        const daySpan = Math.floor((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
        
        // Determine the date range: 15 days from earliest or last 15 days, but cap at today
        let startDate, endDate;
        if (daySpan <= 15) {
            // If tests are within 15 days, start from earliest test
            startDate = new Date(earliestDate);
            endDate = new Date(Math.min(new Date(earliestDate.getTime() + 15 * 24 * 60 * 60 * 1000), today));
        } else {
            // If tests span more than 15 days, show last 15 days
            endDate = new Date(Math.min(latestDate, today));
            startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 15);
        }

        const typeKeys = Object.values(assessmentTypes);
        const perTypeDaily = typeKeys.reduce((acc, type) => ({ ...acc, [type]: {} }), {});

        assessments.forEach(item => {
            const type = normalizeType(item);
            if (!typeKeys.includes(type)) return;

            const dateObj = new Date(item.date);
            if (Number.isNaN(dateObj.getTime())) return;

            const dayKey = dateObj.toISOString().split('T')[0];
            const isWithinRange = dateObj >= startDate && dateObj <= endDate;
            if (!isWithinRange) return;

            const score = typeof item.score === 'number' ? item.score : 0;
            const existingScore = perTypeDaily[type][dayKey];
            perTypeDaily[type][dayKey] = existingScore !== undefined ? Math.max(existingScore, score) : score;
        });

        const lastScore = {};
        const series = [];
        const daysToShow = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));

        for (let i = 0; i <= daysToShow; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dayKey = date.toISOString().split('T')[0];

            const point = {
                dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            };

            typeKeys.forEach(type => {
                const dailyScore = perTypeDaily[type][dayKey];
                if (dailyScore !== undefined) {
                    lastScore[type] = dailyScore;
                }
                if (lastScore[type] !== undefined) {
                    point[type] = lastScore[type];
                }
            });

            series.push(point);
        }

        return series;
    }, [assessments]);

    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 text-center">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
                    <div className="h-64 bg-gray-300 rounded"></div>
                </div>
            </div>
        );
    }

    if (timeSeries.length === 0) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-lg p-8 text-center border border-blue-200">
                <p className="text-gray-600 text-lg">কোনো মূল্যায়ন ডেটা পাওয়া যায়নি</p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg p-8 border border-blue-100">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">📊</span>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        পূর্বের ফলাফল দেখুন
                    </h3>
                </div>
                <p className="text-gray-600 ml-12">সর্বশেষ ১৫ দিনের ট্রেন্ড</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart 
                            data={timeSeries} 
                            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="colorPHQ" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorGAD" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorPSS" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                            <XAxis 
                                dataKey="dateLabel" 
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#9ca3af"
                            />
                            <YAxis 
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                stroke="#9ca3af"
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '12px', 
                                    border: '2px solid #e0e7ff',
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                }}
                                labelStyle={{ color: '#1f2937', fontWeight: 'bold' }}
                                formatter={(value) => [value.toFixed(1), '']}
                            />
                            <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                formatter={(value) => (
                                    <span className="text-gray-700 font-semibold">
                                        {testIcons[value]} {testLabels[value]}
                                    </span>
                                )}
                            />
                            {Object.values(assessmentTypes).map(type => (
                                <Line
                                    key={type}
                                    type="monotone"
                                    dataKey={type}
                                    stroke={lineColors[type]}
                                    strokeWidth={3}
                                    dot={{ fill: lineColors[type], r: 5 }}
                                    activeDot={{ r: 7 }}
                                    connectNulls
                                    name={type}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {Object.values(assessmentTypes).map(type => {
                    const validScores = timeSeries
                        .map(d => d[type])
                        .filter(s => s !== undefined);
                    const latest = validScores[validScores.length - 1];
                    const maxConfig = assessmentConfig[type];
                    const maxScore = maxConfig?.maxScore || 0;

                    return (
                        <div 
                            key={type}
                            className="bg-white rounded-lg p-5 shadow-md border-l-4"
                            style={{ borderColor: lineColors[type] }}
                        >
                            <div className="text-center">
                                <p className="text-3xl mb-2">{testIcons[type]}</p>
                                <p className="text-sm font-semibold text-gray-600 mb-2">
                                    {testLabels[type]}
                                </p>
                                {latest !== undefined ? (
                                    <>
                                        <p className="text-2xl font-bold" style={{ color: lineColors[type] }}>
                                            {latest}/{maxScore}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">সর্বশেষ স্কোর</p>
                                    </>
                                ) : (
                                    <p className="text-gray-400 text-sm">কোনো ডেটা নেই</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CombinedAssessmentGraph;
