"use client";

import React, { useState, useEffect } from "react";

const LikeButton = ({ like, count }: { like: boolean; count: number }) => {
  const [isLiked, setIsLiked] = useState(like);
  const [likeCount, setLikeCount] = useState(count);

  const toggleLike = () => {
    setIsLiked(!isLiked);
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
  };

  useEffect(() => {}, [likeCount]);

  return (
    <button
      className={`absolute left-2 bottom-2 rounded-full bg-gray-200 px-3 py-2 opacity-90 hover:opacity-100 hover:text-red-500 transition duration-200 ${
        isLiked ? "text-red-500" : "text-gray-400"
      }`}
      onClick={toggleLike}
    >
      <div className="flex space-x-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={isLiked ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 21.35l-1.45-1.32C5.4 16.05 2 12.12 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.62-3.4 7.54-8.55 11.54L12 21.35z"
          />
        </svg>
        <p className="text-base-semibold">{likeCount}</p>
      </div>
    </button>
  );
};

export default LikeButton;
