import { useQuery } from "@tanstack/react-query";
import { getSubscribedTags } from "@/lib/fetch-data";

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

export function useSubscribedTags() {
  const fallbackData: ITag[] = [];
  const { data: tags = fallbackData } = useQuery({
    queryKey: ["subscribedTags"],
    queryFn: () => getSubscribedTags(),
  });

  return { tags };
}
