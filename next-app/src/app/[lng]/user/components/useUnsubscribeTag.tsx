"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

export interface ITag {
  tagId: string;
  subscriptionId: string;
  ja: string;
  en: string;
  ko: string;
  property: string;
  linkCount: number;
  tagCreatedAt: string;
  subscribedAt: string;
}

function setUnsubscribeTag(tagId: string) {
  return fetch(`/api/subscriptions/tags/${tagId}/unsubscribe`, {
    method: "PUT",
    body: JSON.stringify({ tagId }),
  }).then((res) => res.json());
}
export function useUnsubscribeTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate } = useMutation({
    mutationFn: (tagId: string) => setUnsubscribeTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribedTags"] });
      queryClient.invalidateQueries({ queryKey: ["capsule"] });
    },
    onSettled: (data, error, variables) => {
      queryClient.setQueryData(
        ["subscribedTags"],
        (oldData: ITag[] | undefined) => {
          return oldData?.filter((tag: ITag) => tag.tagId !== variables) ?? [];
        },
      );
    },
    onError: (error, variables, context) => {
      const errorMessage =
        error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return mutate;
}
