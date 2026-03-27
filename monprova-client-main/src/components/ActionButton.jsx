import React from 'react';
import Button from './Button';
import { Link } from 'react-router-dom';

const ActionButton = ({link , btnName, bgColor}) => {
    return (
        <div className='flex justify-center text-center my-12'>
            <Link to={link}>
             <Button btnName={btnName} bgColor={bgColor}></Button>
            </Link>
        </div>
    );
};

export default ActionButton;