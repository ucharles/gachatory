import { useQuery } from "@tanstack/react-query";
import { getTags } from "@/lib/fetch-data";

export function useTags(search: string) {
  return useQuery({
    queryKey: ["tags", search],
    queryFn: () => getTags(search),
  });
}
