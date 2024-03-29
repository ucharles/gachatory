"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";

import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { updateLikes } from "@/lib/updateLikes";
import { translate } from "@/app/i18n/client";

interface ILikeButtonProps {
  lng: string;
  like: boolean;
  capsuleId: string;
  queryKey: any[];
}

const LikeButton = ({ lng, like, capsuleId, queryKey }: ILikeButtonProps) => {
  const { data: session } = useSession({
    required: false,
    onUnauthenticated() {},
  });
  const { toast } = useToast();
  const { t } = translate(lng, "like");

  const queryClient = useQueryClient();

  const [isLiked, setIsLiked] = useState(like);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleLike = session
    ? () => {
        if (isLikeLoading) return;
        setIsLikeLoading(true);
        setTimeout(() => {
          setIsLikeLoading(false);
        }, 1000);

        toggleLike();
        updateLikes(queryClient, queryKey[0], capsuleId);

        fetchLike();
      }
    : () => {
        toast({
          title: t("loginRequired"),
          description: t("loginRequiredMessage"),
          variant: "destructive",
          action: (
            <Link href="/auth/signin">
              <ToastAction altText="Login">{t("login")}</ToastAction>
            </Link>
          ),
        });
      };

  const fetchLike = async () => {
    if (!session) return;

    setTimeout(async () => {
      const response = await fetch(`/api/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capsuleId: capsuleId,
        }),
      });
      const data = await response.json();
      console.log(data);
    }, 500);
  };

  return (
    <>
      <button className="" onClick={handleLike} disabled={isLikeLoading}>
        <div className="flex items-center space-x-1">
          <svg
            id="favorite_black_18dp"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 16 16"
            className={`active:animate-heartBounce transition-transform duration-300`}
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
    </>
  );
};

export default LikeButton;
