import { useEffect, useState } from "react";


const useVideos = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
       // Fetch from both static JSON and MongoDB
       Promise.all([
           fetch('/videos.json').then(res => res.json()),
           fetch('https://monprova-server.vercel.app/api/videos').then(res => res.json())
       ])
           .then(([staticVideos, dbVideos]) => {
               // Convert DB videos to match the card format
               const convertedDbVideos = dbVideos.map(video => ({
                   id: video._id,
                   title: video.title,
                   category: video.category,
                   link: video.videoLink,
                   embedLink: convertToEmbedLink(video.videoLink)
               }));
               
               // Combine static and DB videos
               setVideos([...staticVideos, ...convertedDbVideos]);
               setLoading(false);
           })
           .catch(err => {
               console.error("Error fetching videos data:", err);
               // Fallback to static videos only
               fetch('/videos.json')
                   .then(res => res.json())
                   .then(data => {
                       setVideos(data);
                       setLoading(false);
                   });
           });
    }, []);

    // Helper function to convert video URL to embed link
    const convertToEmbedLink = (url) => {
        // YouTube URL conversion
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = '';
            if (url.includes('youtube.com/watch?v=')) {
                videoId = url.split('v=')[1].split('&')[0];
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1].split('?')[0];
            }
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // For other providers, return as is
        return url;
    };

   return [videos, loading];
};

export default useVideos;