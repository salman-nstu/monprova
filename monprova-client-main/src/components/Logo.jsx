import React from 'react';
import logoImage from '../assets/monlogo.png'; // Adjust the path as necessary
const Logo = () => {
    return (
        <div>
            <div className='flex justify-center items-center gap-4'>
                <div>
                    <img src={logoImage} alt="Logo" className='w-16 h-16 object-fit-cover' />
                </div>
                <div>
                    <p className='text-4xl font-bold text-blue-500'>মনপ্রভা</p>
                </div>
            </div>
        </div>
    );
};

export default Logo;