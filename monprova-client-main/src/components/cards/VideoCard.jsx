
import { Link } from 'react-router-dom';
import Button from '../Button';

const VideoCard = ({ video }) => {

    const { title, description, link, embedLink, category } = video
    return (
        <div>
            <div className="card bg-base-100 shadow-md border-1 rounded-md overflow-hidden">
                <figure>
                    <iframe 
                        className='w-full' 
                        width="" 
                        height="280" 
                        src={embedLink} 
                        title={title || "Video"} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen>
                    </iframe>
                </figure>
                <div className="card-body">
                    <h2 className="card-title text-lg">{title}</h2>
                    {category && <p className="text-sm text-gray-500">ক্যাটাগরি: <span className='ml-4 bg-primary-color px-2 py-1 rounded-md text-white'>{category}</span></p>}
                    {description && <p className="text-sm">{description}</p>}
                </div>
            </div>
          
        </div>

    );
};

export default VideoCard;

