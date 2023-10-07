"use client";

import React, { useState, useEffect } from "react";

const LikeButton = ({ like }: { like: boolean }) => {
  const [isLiked, setIsLiked] = useState(like);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <button className="" onClick={() => setIsLiked(!isLiked)}>
      <div className="flex items-center space-x-1">
        <svg
          id="favorite_black_18dp"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 16 16"
          className="transition duration-200 hover:fill-gigas-700"
          fill={isLiked ? "#5141ae" : "#9f9f9f"}
        >
          <path
            id="패스_14"
            data-name="패스 14"
            d="M0,0H16V16H0Z"
            fill="none"
          />
          <path
            id="패스_15"
            data-name="패스 15"
            d="M8,13.35l-.87-.745C4.04,9.971,2,8.234,2,6.1A3.174,3.174,0,0,1,5.3,3,3.691,3.691,0,0,1,8,4.179,3.691,3.691,0,0,1,10.7,3,3.174,3.174,0,0,1,14,6.1c0,2.132-2.04,3.869-5.13,6.509Z"
          />
        </svg>
      </div>
    </button>
  );
};

export default LikeButton;
