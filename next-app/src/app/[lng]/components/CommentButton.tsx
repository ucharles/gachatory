"use client";

import React, { useState } from "react";
import Image from "next/image";
import CommentIcon from "public/images/icons8-comment-48.png";

const CommentButton = ({ count }: { count: number }) => {
  const [commentCount, setCommentCount] = useState(count);

  return (
    <button
      className={
        "absolute bottom-2 right-2 rounded-full bg-gray-200 px-3 py-2 opacity-90"
      }
    >
      <div className="flex space-x-2">
        <Image
          src={CommentIcon}
          alt="comment"
          width={24}
          height={24}
          className="opacity-40"
        />
        <p className="text-base-semibold text-gray-500">{commentCount}</p>
      </div>
    </button>
  );
};

export default CommentButton;
