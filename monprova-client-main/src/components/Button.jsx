import React from 'react';

const Button = ({btnName, bgColor}) => {
    return (
        <div>
            <button type="button" className={`btn ${bgColor} text-white px-8 py-6 w-full !bg-blue-500`}>{btnName}</button>
        </div>
    );
};

export default Button;