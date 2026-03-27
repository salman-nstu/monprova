import React, { useState } from 'react';
import Hero from '../hero/Hero';
import SectionHeading from '../../shared/SectionHeader';
import DoctorSection from '../doctors/DoctorSection';
import BlogSection from '../blogs/BlogSection';
import VideoSection from '../videos/VideoSection';
import ActionButton from '../../../components/ActionButton';
import { FaBell } from 'react-icons/fa';
import NotificationDropdown from '../../../components/NotificationDropdown';
import useNotifications from '../../../hooks/useNotifications';
import useAuth from '../../../hooks/useAuth';

const Home = () => {
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const { unreadCount } = useNotifications();
    const { user } = useAuth();

    const toggleNotifications = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    return (
        <div className="relative">
            {/* Fixed Notification Button - Top Right Corner */}
            {/* {user && (
                <div className="fixed top-4 right-4 z-[60]">
                    <button
                        onClick={toggleNotifications}
                        className="relative p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-primary-color hover:shadow-xl transition-all"
                    >
                        <FaBell className="text-2xl" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <NotificationDropdown 
                        isOpen={isNotificationOpen} 
                        onClose={() => setIsNotificationOpen(false)} 
                    />
                </div>
            )} */}
            
            <Hero></Hero>
            <div id="doctors" >
                <div className='my-16'>
                    <SectionHeading
                        heading="বিশেষজ্ঞ ডাক্তারগণ"
                        subHeading="আপনার জন্য আমাদের বিশেষজ্ঞ ডাক্তাররা আছে সবসময়"
                    />
                </div>
                <DoctorSection />
            </div>
            <ActionButton link="/doctorList" btnName={"সব ডাক্তার দেখুন"} bgColor={"bg-secondary-color"}></ActionButton>
            
            

            <div id="blogs" className='px-24'>
                <div className='my-16'>
                    <SectionHeading
                        heading="ব্লগসমুহ"
                        subHeading="আপনার মানসিক স্বাস্থ্য সম্পর্কিত ব্লগ পড়ুন"
                    />
                </div>
                <BlogSection />
            </div>
            <ActionButton link="/blogList" btnName={"সব ব্লগ দেখুন"} bgColor={"bg-secondary-color"}></ActionButton>
            <div id="videos" className='px-24'>
                <div className='my-16'>
                    <SectionHeading
                        heading="ভিডিও সেকশন"
                        subHeading="আপনার মানসিক স্বাস্থ্য সম্পর্কিত ভিডিও দেখুন"
                    />
                </div>
                <VideoSection />
            </div>

            <ActionButton link="/videoList" btnName={"সব ভিডিও দেখুন"} bgColor={"bg-secondary-color"}></ActionButton>
        </div>
    );
};

export default Home;





