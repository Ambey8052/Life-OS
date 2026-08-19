import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: async () => (await api.get("/analytics/summary")).data,
  });
}
