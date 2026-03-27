import React from 'react';
import SectionHeader from '../shared/SectionHeader';
import ActionButton from '../../components/ActionButton';
import VideoSection from '../home/videos/VideoSection';
import BlogSection from '../home/blogs/BlogSection';
import PageCover from '../shared/PageCover';

const ResourcesHome = () => {
    return (
        <div>
           
            <PageCover  coverTitle="আমাদের রিসোর্সসমুহ" coverSubtitle="আপনার মানসিক স্বাস্থ্য সম্পর্কিত রিসোর্সস দেখুন" coverImg="https://i.ibb.co.com/gMnKDVQs/2h-media-3q4-V539j-bw-unsplash.jpg"></PageCover>
            <div className='py-8'>
                <SectionHeader heading={"ব্লগসমুহ"} subHeading={"আপনার মানসিক স্বাস্থ্য সম্পর্কিত ব্লগ পড়ুন"}></SectionHeader>
            </div>
            <BlogSection></BlogSection>
            <ActionButton link="blogs" btnName={"সব ব্লগ দেখুন"} bgColor={"bg-secondary-color"}></ActionButton>

            <div className='py-8'>
            <SectionHeader heading={"ভিডিও সেকশন"} subHeading={"আপনার মানসিক স্বাস্থ্য সম্পর্কিত ভিডিও দেখুন"}></SectionHeader>
            </div>
            <VideoSection></VideoSection>
            <ActionButton link="videos" btnName={"সব ভিডিও দেখুন"} bgColor={"bg-secondary-color"}></ActionButton>
        </div>
    );
};

export default ResourcesHome;