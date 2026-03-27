import React from "react";

const ErrorPage = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <img
        src={`https://i.ibb.co.com/fVJx866X/9214780.jpg`}   // your image path
        alt="Error"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
    </div>
  );
};

export default ErrorPage;
