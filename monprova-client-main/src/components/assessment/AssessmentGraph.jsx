import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AssessmentGraph = ({ historyData, assessmentType }) => {
    if (!historyData || historyData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 text-lg">No assessment data available</p>
            </div>
        );
    }

    // Calculate dynamic date range based on test dates
    const allDates = historyData.map(item => new Date(item.date));
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

    // Filter data within the calculated date range
    const filteredData = historyData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= startDate && itemDate <= endDate;
    });

    // Process data for the determined period
    const processedData = filteredData.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: item.score,
        type: item.assessmentType
    }));

    return (
        <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
                আপনার গত ৩০ দিনের ফলাফল
            </h3>

            <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">স্কোর ট্রেন্ড</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#2563eb"
                            dot={{ fill: '#2563eb' }}
                            name="স্কোর"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-700 mb-4">স্কোর বিতরণ</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={processedData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#f3f4f6',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px'
                            }}
                        />
                        <Legend />
                        <Bar dataKey="score" fill="#3b82f6" name="স্কোর" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">গড় স্কোর</p>
                    <p className="text-3xl font-bold text-primary-color">
                        {(processedData.reduce((sum, item) => sum + item.score, 0) / processedData.length).toFixed(1)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">সর্বনিম্ন স্কোর</p>
                    <p className="text-3xl font-bold text-green-600">
                        {Math.min(...processedData.map(item => item.score))}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <p className="text-sm text-gray-600 mb-2">সর্বোচ্চ স্কোর</p>
                    <p className="text-3xl font-bold text-red-600">
                        {Math.max(...processedData.map(item => item.score))}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AssessmentGraph;
