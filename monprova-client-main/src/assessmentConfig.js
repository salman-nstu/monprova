// Assessment Configuration - PHQ-9, GAD-7, PSS-10

export const assessmentTypes = {
    PHQ9: 'PHQ-9',
    GAD7: 'GAD-7',
    PSS10: 'PSS-10'
};

export const assessmentConfig = {
    [assessmentTypes.PHQ9]: {
        id: 'phq9',
        title: 'PHQ-9 (Patient Health Questionnaire-9)',
        subtitle: 'মানসিক বিষণ্নতা মূল্যায়ন',
        description: 'গত দুই সপ্তাহে আপনি কতবার নিম্নলিখিত সমস্যাগুলি দ্বারা বিরক্ত হয়েছেন?',
        duration: '5-10 minutes',
        icon: '😔',
        maxScore: 27,
        severity: {
            0: { label: 'No depression', bangla: 'কোন বিষণ্নতা নেই', color: 'bg-green-100' },
            5: { label: 'Mild', bangla: 'হালকা', color: 'bg-yellow-100' },
            10: { label: 'Moderate', bangla: 'মধ্যম', color: 'bg-orange-100' },
            15: { label: 'Moderately Severe', bangla: 'মধ্যম গুরুতর', color: 'bg-red-100' },
            20: { label: 'Severe', bangla: 'গুরুতর', color: 'bg-red-200' }
        },
        questions: [
            {
                id: 1,
                text: 'কখনো কখনো আপনি কি দুঃখিত বা হতাশ বোধ করেন, যেন সবকিছু বৃথা?',
                options: [
                    { value: 0, label: 'না, কখনোই না', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কিছু দিন', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ দিন', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, প্রায় সবসময়', text: 'Nearly every day' }
                ]
            },
            {
                id: 2,
                text: 'যেসব কাজ বা শখ আগে আপনাকে খুশি করত, সেখানে এখন মজা পাচ্ছেন না?',
                options: [
                    { value: 0, label: 'না, তারা এখনও মজাদার', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কিছু সময়', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, আর কোনো মজা নেই', text: 'Nearly every day' }
                ]
            },
            {
                id: 3,
                text: 'রাতে ঘুমাতে কি সমস্যা হচ্ছে (খুব দেরিতে ঘুমানো বা বেশি ঘুমানো)?',
                options: [
                    { value: 0, label: 'না, ভালো ঘুমাই', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ রাত', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, প্রতি রাত', text: 'Nearly every day' }
                ]
            },
            {
                id: 4,
                text: 'আপনি কি বেশিরভাগ সময় খুব দুর্বল বা পরিশ্রান্ত বোধ করছেন?',
                options: [
                    { value: 0, label: 'না, আমি শক্তিশালী বোধ করি', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কিছু দিন', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ দিন', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, সবসময়', text: 'Nearly every day' }
                ]
            },
            {
                id: 5,
                text: 'আপনার খাওয়ার অভ্যাস পরিবর্তিত হয়েছে (খুব কম খাওয়া বা বেশি খাওয়া)?',
                options: [
                    { value: 0, label: 'না, স্বাভাবিক আছে', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কিছুটা পরিবর্তন', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, যথেষ্ট পরিবর্তন', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, অনেক পরিবর্তন', text: 'Nearly every day' }
                ]
            },
            {
                id: 6,
                text: 'আপনি কি নিজের প্রতি খারাপ বোধ করেন বা নিজেকে ব্যর্থ মনে করেন?',
                options: [
                    { value: 0, label: 'না, আমি ঠিক আছি', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, সবসময়', text: 'Nearly every day' }
                ]
            },
            {
                id: 7,
                text: 'কাজ বা পড়াশোনায় ফোকাস রাখতে কি কষ্ট হচ্ছে?',
                options: [
                    { value: 0, label: 'না, ফোকাস ভালো', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কিছু সমস্যা', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, গুরুতর সমস্যা', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, খুব কঠিন', text: 'Nearly every day' }
                ]
            },
            {
                id: 8,
                text: 'আপনি কি খুবই ধীর গতিতে চলেন বা কথা বলেন অথবা উল্টো বিষয়টি - অন্যরা এটি লক্ষ্য করেছে?',
                options: [
                    { value: 0, label: 'না, স্বাভাবিক', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, সবসময়', text: 'Nearly every day' }
                ]
            },
            {
                id: 9,
                text: 'কখনো কখনো আপনি কি নিজেকে আঘাত করার কথা চিন্তা করেন বা মরে যাওয়া ভালো হত এমন ভাবনা আসে?',
                options: [
                    { value: 0, label: 'না, কখনোই না', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, অনেক', text: 'Nearly every day' }
                ]
            }
        ]
    },
    [assessmentTypes.GAD7]: {
        id: 'gad7',
        title: 'GAD-7 (Generalized Anxiety Disorder-7)',
        subtitle: 'সাধারণ উদ্বেগ ব্যাধি মূল্যায়ন',
        description: 'গত দুই সপ্তাহে আপনি কতবার নিম্নলিখিত সমস্যাগুলি দ্বারা বিরক্ত হয়েছেন?',
        duration: '5-10 minutes',
        icon: '😰',
        maxScore: 21,
        severity: {
            0: { label: 'No anxiety', bangla: 'কোন উদ্বেগ নেই', color: 'bg-green-100' },
            5: { label: 'Mild', bangla: 'হালকা', color: 'bg-yellow-100' },
            10: { label: 'Moderate', bangla: 'মধ্যম', color: 'bg-orange-100' },
            15: { label: 'Severe', bangla: 'গুরুতর', color: 'bg-red-100' }
        },
        questions: [
            {
                id: 1,
                text: 'আপনি কি নিজেকে অস্থির, চিন্তিত বা তৎপর বোধ করেন?',
                options: [
                    { value: 0, label: 'না, একদমই না', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কিছু দিন', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ দিন', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, প্রায় প্রতিদিন', text: 'Nearly every day' }
                ]
            },
            {
                id: 2,
                text: 'আপনার চিন্তা কি আপনার নিয়ন্ত্রণের বাইরে চলে যায় এবং থামাতে পারেন না?',
                options: [
                    { value: 0, label: 'না, আমি নিয়ন্ত্রণ করতে পারি', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, সবসময়', text: 'Nearly every day' }
                ]
            },
            {
                id: 3,
                text: 'আপনি কি অনেক কিছু নিয়ে চিন্তা করেন - কাজ, পরিবার, অর্থ, স্বাস্থ্য ইত্যাদি?',
                options: [
                    { value: 0, label: 'না, স্বাভাবিক', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কিছু বিষয়', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, অনেক বিষয়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, সবকিছুই', text: 'Nearly every day' }
                ]
            },
            {
                id: 4,
                text: 'শান্ত হয়ে বসতে বা থাকতে আপনার কি কঠিন লাগে?',
                options: [
                    { value: 0, label: 'না, আমি শান্ত থাকতে পারি', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, সবসময়', text: 'Nearly every day' }
                ]
            },
            {
                id: 5,
                text: 'আপনি কি এত বিচলিত বা অধীর বোধ করেন যে আপনার জন্য কিছু করা কঠিন হয়ে যায়?',
                options: [
                    { value: 0, label: 'না, কোনো সমস্যা নেই', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, যথেষ্ট', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, খুবই', text: 'Nearly every day' }
                ]
            },
            {
                id: 6,
                text: 'আপনি কি ভয় পান যে খারাপ কিছু ঘটতে যাচ্ছে?',
                options: [
                    { value: 0, label: 'না, আমি নিরাপদ বোধ করি', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, কখনো কখনো', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, সবসময়', text: 'Nearly every day' }
                ]
            },
            {
                id: 7,
                text: 'আপনি কি শ্বাসকষ্ট, বুক দ্রুত স্পন্দন বা শারীরিক অস্বস্তি অনুভব করেন?',
                options: [
                    { value: 0, label: 'না, কখনোই না', text: 'Not at all' },
                    { value: 1, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Several days' },
                    { value: 2, label: 'হ্যাঁ, বেশিরভাগ দিন', text: 'More than half the days' },
                    { value: 3, label: 'হ্যাঁ, ঘন ঘন', text: 'Nearly every day' }
                ]
            }
        ]
    },
    [assessmentTypes.PSS10]: {
        id: 'pss10',
        title: 'PSS-10 (Perceived Stress Scale-10)',
        subtitle: 'অনুভূত স্ট্রেস স্কেল',
        description: 'গত এক মাসে, আপনি কতবার নিম্নলিখিত অনুভব করেছেন?',
        duration: '5-10 minutes',
        icon: '😟',
        maxScore: 40,
        severity: {
            0: { label: 'Low stress', bangla: 'কম চাপ', color: 'bg-green-100' },
            13: { label: 'Moderate stress', bangla: 'মধ্যম চাপ', color: 'bg-yellow-100' },
            26: { label: 'High stress', bangla: 'উচ্চ চাপ', color: 'bg-red-100' }
        },
        questions: [
            {
                id: 1,
                text: 'গত মাসে, হঠাৎ কিছু ঘটে গেছে যা আপনাকে মানসিক চাপে ফেলেছে?',
                options: [
                    { value: 0, label: 'না, কখনোই না', text: 'Never' },
                    { value: 1, label: 'খুব কমই হয়েছে', text: 'Almost never' },
                    { value: 2, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Sometimes' },
                    { value: 3, label: 'হ্যাঁ, বেশ কয়েকবার', text: 'Fairly often' },
                    { value: 4, label: 'হ্যাঁ, প্রায়ই হয়েছে', text: 'Very often' }
                ]
            },
            {
                id: 2,
                text: 'জীবনের গুরুত্বপূর্ণ দায়িত্বগুলো সামলাতে গিয়ে কি অসহায় বোধ করেছেন?',
                options: [
                    { value: 0, label: 'না, সবকিছু নিয়ন্ত্রণে আছে', text: 'Never' },
                    { value: 1, label: 'না, খুব কমই এমন হয়েছে', text: 'Almost never' },
                    { value: 2, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Sometimes' },
                    { value: 3, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'Fairly often' },
                    { value: 4, label: 'হ্যাঁ, প্রায়শই', text: 'Very often' }
                ]
            },
            {
                id: 3,
                text: 'মনের মধ্যে অস্থিরতা আর মানসিক চাপ অনুভব করেছেন কি ?',
                options: [
                    { value: 0, label: 'না, শান্ত ছিলাম', text: 'Never' },
                    { value: 1, label: 'খুব সামান্য', text: 'Almost never' },
                    { value: 2, label: 'হ্যাঁ, কিছুটা', text: 'Sometimes' },
                    { value: 3, label: 'হ্যাঁ, বেশ অস্থির ছিলাম', text: 'Fairly often' },
                    { value: 4, label: 'হ্যাঁ, খুব বেশি', text: 'Very often' }
                ]
            },
            {
                id: 4,
                text: 'নিজের সমস্যা সমাধানের ক্ষমতার উপর কি আত্মবিশ্বাস ছিল?',
                options: [
                    { value: 4, label: 'হ্যাঁ, পুরোপুরি ছিল', text: 'Never' },
                    { value: 3, label: 'হ্যাঁ, বেশিরভাগ সময়ই', text: 'Almost never' },
                    { value: 2, label: 'মাঝামাঝি ছিল', text: 'Sometimes' },
                    { value: 1, label: 'না, খুব কমই', text: 'Fairly often' },
                    { value: 0, label: 'না, একদমই ছিল না', text: 'Very often' }
                ]
            },
            {
                id: 5,
                text: 'মনে হয়েছে যে জীবনের ঘটনাগুলো আপনার হাতের মুঠোয় আছে?',
                options: [
                    { value: 4, label: 'হ্যাঁ, সবকিছুই নিয়ন্ত্রণে', text: 'Never' },
                    { value: 3, label: 'হ্যাঁ, অধিকাংশ সময়', text: 'Almost never' },
                    { value: 2, label: 'মাঝামাঝি অবস্থা', text: 'Sometimes' },
                    { value: 1, label: 'না, খুব কম সময়', text: 'Fairly often' },
                    { value: 0, label: 'না, একেবারেই না', text: 'Very often' }
                ]
            },
            {
                id: 6,
                text: 'আপনার প্রয়োজনীয় সব কাজ কি ঠিকমতো সামলাতে পেরেছেন?',
                options: [
                    { value: 4, label: 'হ্যাঁ, সবকিছুই পেরেছি', text: 'Never' },
                    { value: 3, label: 'হ্যাঁ, প্রায় সবই', text: 'Almost never' },
                    { value: 2, label: 'কিছু কিছু কাজ', text: 'Sometimes' },
                    { value: 1, label: 'না, খুব কমই', text: 'Fairly often' },
                    { value: 0, label: 'না, কিছুই পারিনি', text: 'Very often' }
                ]
            },
            {
                id: 7,
                text: 'রাগ এতটা বেড়ে গেছে যে নিজেকে সামলাতে কঠিন হয়েছে?',
                options: [
                    { value: 0, label: 'না, রাগ সামলাতে পেরেছি', text: 'Never' },
                    { value: 1, label: 'না, প্রায় সামলাতে পেরেছি', text: 'Almost never' },
                    { value: 2, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Sometimes' },
                    { value: 3, label: 'হ্যাঁ, বেশ কয়েকবার', text: 'Fairly often' },
                    { value: 4, label: 'হ্যাঁ, প্রায়ই হয়েছে', text: 'Very often' }
                ]
            },
            {
                id: 8,
                text: 'সমস্যার সমাধান খুঁজে পেতে কি অনেক কষ্ট হয়েছে?',
                options: [
                    { value: 0, label: 'না, সহজেই পেরেছি', text: 'Never' },
                    { value: 1, label: 'না, তেমন কষ্ট হয়নি', text: 'Almost never' },
                    { value: 2, label: 'হ্যাঁ, কিছুটা কষ্ট', text: 'Sometimes' },
                    { value: 3, label: 'হ্যাঁ, যথেষ্ট কষ্ট', text: 'Fairly often' },
                    { value: 4, label: 'হ্যাঁ, খুব কষ্ট হয়েছে', text: 'Very often' }
                ]
            },
            {
                id: 9,
                text: 'চাপের ভারে এতটাই ভারাক্রান্ত বোধ করেছেন যে কিছু করতে পারেননি?',
                options: [
                    { value: 0, label: 'না, আমি সক্রিয় ছিলাম', text: 'Never' },
                    { value: 1, label: 'না, খুব কমই', text: 'Almost never' },
                    { value: 2, label: 'হ্যাঁ, মাঝেমধ্যে', text: 'Sometimes' },
                    { value: 3, label: 'হ্যাঁ, প্রায়ই', text: 'Fairly often' },
                    { value: 4, label: 'হ্যাঁ, খুবই বেশি', text: 'Very often' }
                ]
            },
            {
                id: 10,
                text: 'মনে হয়েছে যে মানসিক চাপ আপনার নিয়ন্ত্রণের বাইরে চলে গেছে?',
                options: [
                    { value: 0, label: 'না, সব নিয়ন্ত্রণে ছিল', text: 'Never' },
                    { value: 1, label: 'না, প্রায় নিয়ন্ত্রণে ছিল', text: 'Almost never' },
                    { value: 2, label: 'হ্যাঁ, কখনো কখনো', text: 'Sometimes' },
                    { value: 3, label: 'হ্যাঁ, বেশিরভাগ সময়', text: 'Fairly often' },
                    { value: 4, label: 'হ্যাঁ, প্রায় সবসময়', text: 'Very often' }
                ]
            }
        ]
    }
};

export const calculateScore = (assessmentType, answers) => {
    const questions = assessmentConfig[assessmentType].questions;
    let score = 0;
    
    answers.forEach((answer) => {
        if (answer && answer.value !== undefined) {
            score += answer.value;
        }
    });
    
    return score;
};

export const getSeverityLevel = (assessmentType, score) => {
    const config = assessmentConfig[assessmentType];
    const severityKeys = Object.keys(config.severity).map(Number).sort((a, b) => b - a);
    
    for (let key of severityKeys) {
        if (score >= key) {
            return config.severity[key];
        }
    }
    
    return config.severity[0];
};
