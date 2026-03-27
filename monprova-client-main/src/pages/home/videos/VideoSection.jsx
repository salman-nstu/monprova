import React from 'react';
import useVideos from '../../../hooks/useVideos';
import VideoCard from '../../../components/cards/VideoCard';
import { Link } from 'react-router-dom';
import Button from '../../../components/Button';


const VideoSection = () => {
    const [videos] = useVideos();
    return (
        <div className='mt-6' id="videos">
            <div className='grid grid-cols-3 gap-8 mx-auto px-0'>
                {
                    videos.slice(0, 6).map(video => (
                        <VideoCard key={video.id} video={video} />
                    ))
                }
            </div>
          
        </div>
    );
};

export default VideoSection;
