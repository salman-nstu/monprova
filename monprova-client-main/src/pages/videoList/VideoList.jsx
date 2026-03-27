import React from 'react';
import PageCover from '../shared/PageCover';
import useVideos from '../../hooks/useVideos';
import VideoCard from '../../components/cards/VideoCard';

const VideoList = () => {
    const [videos, loading] = useVideos();
    
    if (loading) {
        return (
            <div>
                <PageCover coverTitle="আমাদের ভিডিওসমুহ" coverSubtitle="আপনার মানসিক স্বাস্থ্য সম্পর্কিত ভিডিও দেখুন" coverImg="https://i.ibb.co.com/9937tx6s/collabstr-n-JQBpe-ZIwk8-unsplash.jpg"></PageCover>
                <div className='text-center py-12'>লোড হচ্ছে...</div>
            </div>
        );
    }

    return (
        <div>
            <PageCover coverTitle="আমাদের ভিডিওসমুহ" coverSubtitle="আপনার মানসিক স্বাস্থ্য সম্পর্কিত ভিডিও দেখুন" coverImg="https://i.ibb.co.com/9937tx6s/collabstr-n-JQBpe-ZIwk8-unsplash.jpg"></PageCover>
            {videos.length > 0 ? (
                <div className='grid grid-cols-3 gap-8 mx-auto px-0 mt-16 pb-16'>
                    {
                        videos.map(video => (
                            <VideoCard key={video.id} video={video} />
                        ))
                    }
                </div>
            ) : (
                <div className='text-center py-12 text-gray-600'>কোন ভিডিও পাওয়া যায়নি</div>
            )}
        </div>
    );
};

export default VideoList;