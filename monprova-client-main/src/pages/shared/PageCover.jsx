import React from "react";

const PageCover = ({coverTitle, coverSubtitle, coverImg}) => {
  return (
    <div className="relative h-[280px] w-full">
      {/* Background Image */}
      <img
        className="absolute inset-0 h-full w-full object-cover"
        src={coverImg}
        alt=""
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Centered Content */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="bg-black bg-opacity-25   w-full mx-24 text-center rounded-sm p-24">
          <h2 className="text-white text-4xl font-bold">
            {coverTitle}
          </h2>
          <p className="text-white text-lg mt-4">{coverSubtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default PageCover;
