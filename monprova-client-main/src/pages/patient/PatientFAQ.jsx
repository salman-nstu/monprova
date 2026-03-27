import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const PatientFAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);
    const navigate = useNavigate();

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const faqs = [
        {
            question: "মনপ্রভা কী এবং এটি কীভাবে কাজ করে?",
            answer: "মনপ্রভা একটি মানসিক স্বাস্থ্য সেবা প্ল্যাটফর্ম যেখানে আপনি অভিজ্ঞ মনোরোগ বিশেষজ্ঞদের সাথে অনলাইন এবং অফলাইন উভয় মাধ্যমে পরামর্শ নিতে পারবেন। আমাদের প্ল্যাটফর্মে আপনি অ্যাপয়েন্টমেন্ট বুক করতে, মানসিক স্বাস্থ্য মূল্যায়ন করতে, এবং বিভিন্ন রিসোর্স পেতে পারবেন।"
        },
        {
            question: "কীভাবে একটি অ্যাপয়েন্টমেন্ট বুক করবো?",
            answer: "অ্যাপয়েন্টমেন্ট বুক করতে:\n১. 'বুক করুন' বাটনে ক্লিক করুন অথবা ডাক্তার তালিকায় যান\n২. আপনার পছন্দের ডাক্তার নির্বাচন করুন\n৩. তারিখ, সময় এবং মাধ্যম (অনলাইন/অফলাইন) নির্বাচন করুন\n৪. আপনার তথ্য পূরণ করুন\n৫. পেমেন্ট সম্পন্ন করুন\n৬. নিশ্চিতকরণ পাবেন এবং ড্যাশবোর্ডে অ্যাপয়েন্টমেন্ট দেখতে পারবেন"
        },
        {
            question: "অনলাইন সেশন কীভাবে হয়?",
            answer: "অনলাইন সেশন ভিডিও কলের মাধ্যমে হয়। অ্যাপয়েন্টমেন্টের সময় হলে, আপনার ড্যাশবোর্ডে 'জয়েন করুন' বাটন দেখাবে। সেখানে ক্লিক করে আপনি সরাসরি ডাক্তারের সাথে যুক্ত হতে পারবেন। নিশ্চিত করুন যে আপনার ইন্টারনেট সংযোগ স্থিতিশীল এবং ক্যামেরা ও মাইক্রোফোন কাজ করছে।"
        },
        {
            question: "মানসিক স্বাস্থ্য মূল্যায়ন কী এবং কেন গুরুত্বপূর্ণ?",
            answer: "মানসিক স্বাস্থ্য মূল্যায়ন একটি বৈজ্ঞানিক পদ্ধতি যা আপনার বর্তমান মানসিক অবস্থা পরিমাপ করে। এটি বিষণ্নতা, উদ্বেগ, চাপ ইত্যাদি শনাক্ত করতে সাহায্য করে। নিয়মিত মূল্যায়ন করলে আপনি আপনার মানসিক স্বাস্থ্যের অগ্রগতি ট্র্যাক করতে পারবেন এবং সঠিক সময়ে পেশাদার সাহায্য নিতে পারবেন।"
        },
        {
            question: "প্রেসক্রিপশন কীভাবে পাবো?",
            answer: "ডাক্তারের সাথে পরামর্শ শেষ হলে, ডাক্তার আপনার জন্য ডিজিটাল প্রেসক্রিপশন তৈরি করবেন। এটি স্বয়ংক্রিয়ভাবে আপনার ড্যাশবোর্ডের 'প্রেসক্রিপশন' সেকশনে সংরক্ষিত হবে। আপনি যেকোনো সময় দেখতে এবং ডাউনলোড করতে পারবেন।"
        },
        {
            question: "পেমেন্ট কীভাবে করবো?",
            answer: "আমরা বিভিন্ন পেমেন্ট মাধ্যম গ্রহণ করি:\n• বিকাশ\n• নগদ\n• রকেট\n• ক্রেডিট/ডেবিট কার্ড\nঅ্যাপয়েন্টমেন্ট বুকিং এর সময় আপনার পছন্দের মাধ্যম নির্বাচন করুন এবং নির্দেশনা অনুসরণ করুন।"
        },
        {
            question: "আমার প্রোফাইল কীভাবে আপডেট করবো?",
            answer: "ড্যাশবোর্ডে 'প্রোফাইল' বাটনে ক্লিক করুন। সেখানে আপনি আপনার ব্যক্তিগত তথ্য, যোগাযোগের বিবরণ, জরুরি যোগাযোগ, রক্তের গ্রুপ এবং ছবি আপডেট করতে পারবেন। সম্পূর্ণ প্রোফাইল আপনার চিকিৎসায় সহায়ক হবে।"
        },
        {
            question: "জরুরি সাহায্য প্রয়োজন হলে কী করবো?",
            answer: "যদি এটি জরুরি মানসিক স্বাস্থ্য সংকট হয় (যেমন: আত্মহত্যার চিন্তা), অনুগ্রহ করে অবিলম্বে:\n• জাতীয় মানসিক স্বাস্থ্য হটলাইনে যোগাযোগ করুন: ১৬১২৩\n• নিকটস্থ হাসপাতালের জরুরি বিভাগে যান\n• বিশ্বস্ত কারো সাথে কথা বলুন\nমনপ্রভা দীর্ঘমেয়াদী মানসিক স্বাস্থ্য সেবার জন্য, জরুরি সেবার জন্য নয়।"
        },
        {
            question: "আমার তথ্য কি সুরক্ষিত?",
            answer: "হ্যাঁ, আমরা আপনার সকল তথ্যের গোপনীয়তা এবং নিরাপত্তা অত্যন্ত গুরুত্বের সাথে নিশ্চিত করি। আপনার চিকিৎসা তথ্য এনক্রিপ্টেড এবং শুধুমাত্র আপনার অনুমোদিত ডাক্তার দেখতে পারবেন। আমরা HIPAA এবং স্থানীয় ডেটা সুরক্ষা নীতিমালা অনুসরণ করি।"
        },
        {
            question: "রিসোর্স (ভিডিও ও ব্লগ) কীভাবে ব্যবহার করবো?",
            answer: "আমাদের রিসোর্স সেকশনে মানসিক স্বাস্থ্য সম্পর্কিত শিক্ষামূলক ভিডিও এবং ব্লগ রয়েছে। এগুলো সম্পূর্ণ বিনামূল্যে এবং আপনাকে:\n• মানসিক স্বাস্থ্য সচেতনতা বাড়াতে\n• বিভিন্ন কৌশল শিখতে (যেমন: মেডিটেশন, শ্বাস-প্রশ্বাসের ব্যায়াম)\n• অন্যদের অভিজ্ঞতা থেকে শিখতে সাহায্য করবে।"
        },
        {
            question: "প্রথমবার কোন ডাক্তার বেছে নেব?",
            answer: "প্রতিটি ডাক্তারের প্রোফাইলে তাদের বিশেষত্ব, অভিজ্ঞতা এবং রোগীদের রিভিউ দেওয়া আছে। আপনার সমস্যার ধরন অনুযায়ী ডাক্তার নির্বাচন করুন:\n• বিষণ্নতা/উদ্বেগ: Clinical Psychologist\n• মানসিক রোগ: Psychiatrist\n• সম্পর্কের সমস্যা: Counseling Psychologist\nঅথবা আপনি মূল্যায়ন করে সিস্টেম থেকে সুপারিশ পেতে পারেন।"
        }
    ];

    return (
        <div className="min-h-screen bg-[#E6F0FF] p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FaQuestionCircle className="text-5xl text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">
                        সাধারণ প্রশ্নোত্তর (FAQ)
                    </h1>
                    <p className="text-lg text-gray-600">মনপ্রভা সম্পর্কে প্রায়শই জিজ্ঞাসিত প্রশ্নসমূহ</p>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <h3 className="text-lg font-semibold text-gray-800 text-left pr-4">
                                        {faq.question}
                                    </h3>
                                    {openIndex === index ? (
                                        <FaChevronUp className="text-blue-600 flex-shrink-0 text-xl" />
                                    ) : (
                                        <FaChevronDown className="text-gray-400 flex-shrink-0 text-xl" />
                                    )}
                                </button>
                                
                                {openIndex === index && (
                                    <div className="p-5 bg-white border-t border-gray-200">
                                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Help Section */}
                <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        আরও সাহায্য প্রয়োজন?
                    </h3>
                    <p className="text-gray-700 mb-4">
                        আপনার প্রশ্নের উত্তর খুঁজে পাননি? আমাদের সাহায্য বিভাগে যোগাযোগ করুন।
                    </p>
                    <button 
                        onClick={() => navigate('/contact')}
                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        যোগাযোগ করুন
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PatientFAQ;
