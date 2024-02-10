import { QueryClient } from "@tanstack/react-query";
import { ILike } from "@/lib/models/like-model";
import { ICapsuleToy } from "@/lib/models/capsule-model";
import { match } from "assert";

interface Capsules {
  totalCount: number;
  capsules: ICapsuleToy[];
  page: number;
}

interface Likes {
  totalCount: number;
  likes: ILike[];
  page: number;
}

interface InfinityCapsules {
  totalCount: number;
  pages: Capsules[];
  page: number;
}

interface InfinityLikes {
  totalCount: number;
  pages: Likes[];
  page: number;
}

interface ArrivalCapsules extends InfinityCapsules {}
interface LikedCapsules extends InfinityLikes {}
interface SearchCapsules extends Capsules {}
interface RecentLikes extends Likes {}
interface Capsule extends ICapsuleToy {}

export function updateLikes(
  queryClient: QueryClient,
  queryKey: string,
  updatedId: string,
) {
  // Invalidate queries that don't depend on a specific ID

  const invalidateLikesQueryKeys = [
    "arrivalCapsules",
    "searchCapsules",
    "capsule",
  ];

  const matchedArrivalCapsulesQueries = queryClient.getQueriesData({
    queryKey: ["arrivalCapsules"],
  });
  matchedArrivalCapsulesQueries.length > 0 &&
    queryClient.setQueryData(
      matchedArrivalCapsulesQueries[0][0],
      (oldData: any) => {
        const newPages = oldData.pages.map((page: any) => {
          return {
            ...page,
            capsules: page.capsules.map((capsule: any) => {
              if (capsule._id === updatedId) {
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
      },
    );

  const matchedSearchCapsulesQueries = queryClient.getQueriesData({
    queryKey: ["searchCapsules"],
  });

  matchedSearchCapsulesQueries.length > 0 &&
    queryClient.setQueryData(
      matchedSearchCapsulesQueries[0][0],
      (oldData: any) => {
        return {
          ...oldData,
          capsules: oldData.capsules.map((capsule: any) => {
            if (capsule._id === updatedId) {
              return {
                ...capsule,
                like: !capsule.like,
              };
            }
            return capsule;
          }),
        };
      },
    );

  const matchedCapsuleQueries = queryClient.getQueriesData({
    queryKey: ["capsule"],
  });

  matchedCapsuleQueries.length > 0 &&
    queryClient.setQueryData(matchedCapsuleQueries[0][0], (oldData: any) => {
      return {
        ...oldData,
        like: !oldData.like,
      };
    });

  if (invalidateLikesQueryKeys.includes(queryKey)) {
    queryClient.invalidateQueries({ queryKey: ["likedCapsules"] });
  } else {
    const matchedLikedCapsulesQueries = queryClient.getQueriesData({
      queryKey: ["likedCapsules"],
    });

    matchedLikedCapsulesQueries.length > 0 &&
      matchedLikedCapsulesQueries.forEach((query: any) => {
        queryClient.setQueryData(query[0], (oldData: any) => {
          console.log("Updating for ID:", updatedId); // ID 로깅
          const newData = {
            ...oldData,
            pages: oldData?.pages.map((page: any) => {
              console.log("Before filter:", page.likes); // 필터 적용 전 로깅
              const filteredLikes = page.likes.filter((like: any) => {
                console.log("Comparing:", like._id, "with", updatedId); // 비교 로깅
                return like.capsuleId._id !== updatedId;
              });
              console.log("After filter:", filteredLikes); // 필터 적용 후 로깅
              return {
                ...page,
                likes: filteredLikes,
              };
            }),
          };
          console.log("Updated data:", newData); // 업데이트된 데이터 로깅
          return newData;
        });
      });
  }
}
