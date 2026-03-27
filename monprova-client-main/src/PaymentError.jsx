import React from 'react';

const PaymentError = () => {
    return (
       <div style={{ width: "100vw", height: "100vh" }} className=''>
      <div className='flex justify-center items-center'>
        <img
        src={`https://i.ibb.co.com/JJvSr9x/image.png`}   // your image path
        alt="Error"
        style={{
          width: "80%",
          height: "80%",
          objectFit: "cover",
        }}
      />
      </div>
    </div>
    );
};

export default PaymentError;