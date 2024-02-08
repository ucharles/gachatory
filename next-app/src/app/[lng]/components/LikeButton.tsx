"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";
import LoginAlert from "./LoginAlert";

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

  const queryClient = useQueryClient();

  const [isLiked, setIsLiked] = useState(like);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isLogginAlert, setIsLogginAlert] = useState(false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const getMostRecentData = () => {
    const matchingQueries = queryClient.getQueriesData(["capsule", capsuleId]);

    if (matchingQueries.length > 0) {
      const mostRecentQuery = matchingQueries[0];
      return mostRecentQuery;
    }

    return null;
  };

  const handleLike = () => {
    if (session) {
      if (isLikeLoading) return;
      setIsLikeLoading(true);
      setTimeout(() => {
        setIsLikeLoading(false);
      }, 1000);

      toggleLike();

      const mostRecentData = getMostRecentData();
      if (mostRecentData) {
        const mostRecentDataQueryKey = mostRecentData[0];

        queryClient.setQueryData(mostRecentDataQueryKey, (oldData: any) => {
          return {
            ...oldData,
            like: !oldData.like,
          };
        });
      }

      // data update in infinite query
      // data = { pages: [{ 0: [ totalCount: number, capsules:[] ], ... }], pageParams: [] }
      if (queryKey[0] === "arrivalCapsules") {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          const newPages = oldData.pages.map((page: any) => {
            return {
              ...page,
              capsules: page.capsules.map((capsule: any) => {
                if (capsule._id === capsuleId) {
                  return {
                    ...capsule,
                    like: !capsule.like,
                  };
                }
                return capsule;
              }),
            };
          });
          return {
            ...oldData,
            pages: newPages,
          };
        });
      } else if (queryKey[0] === "searchCapsules") {
        queryClient.setQueryData(queryKey, (oldData: any) => {
          return {
            ...oldData,
            capsules: oldData.capsules.map((capsule: any) => {
              if (capsule._id === capsuleId) {
                return {
                  ...capsule,
                  like: !capsule.like,
                };
              }
              return capsule;
            }),
          };
        });
      }

      fetchLike();
    } else {
      // 로그인이 되어있지 않으면 로그인을 하라는 알림을 띄운다.
      // 2초 동안 입력을 받지 않는다.
      if (!isLogginAlert) {
        setIsLogginAlert(true);
        setTimeout(() => {
          setIsLogginAlert(false);
        }, 2000);
      }
    }
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
      <LoginAlert lng={lng} isDisplay={isLogginAlert} />
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
