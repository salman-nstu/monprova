import React from 'react';
import { Link } from 'react-router-dom';

const BackButton = ({destination}) => {
    return (
        <div className="my-2">
            <Link to={`${destination}`}>
                <button className="border-2 rounded-md flex justify-center items-center hover:bg-[#E8594A] hover:text-white transition px-8 py-2  text-sm">
                    ফিরে যান
                </button>
            </Link>
        </div>
    );
};

export default BackButton;