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

async function setUnsubscribeTag(tagId: string) {
  try {
    const response = await fetch(`/api/subscriptions/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // 콘텐트 타입 헤더 추가
      },
      body: JSON.stringify({ tagId }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 서버 응답이 200번대가 아닌 경우 에러를 생성하고 던진다.
      throw new Error(`${data.message}`);
    }

    return data;
  } catch (error) {
    // 네트워크 에러 또는 위에서 던진 에러를 처리
    console.error("Error in setUnsubscribeTag:", error);
    throw error; // 에러를 다시 던져 호출자가 처리할 수 있도록 함
  }
}

export function useSubscribeTag() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { mutate } = useMutation({
    mutationFn: (tagId: string) => setUnsubscribeTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscribedTags"] });
      queryClient.invalidateQueries({ queryKey: ["capsule"] });
      toast({
        description: "Tag Subscribed",
      });
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
