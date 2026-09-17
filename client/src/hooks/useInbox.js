import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useGmailStatus() {
  return useQuery({
    queryKey: ["gmail-status"],
    queryFn: async () => (await api.get("/gmail/status")).data,
  });
}

export function useConnectGmail() {
  return useMutation({
    mutationFn: async () => {
      const { url } = (await api.get("/gmail/connect-url")).data;
      window.location.assign(url);
    },
  });
}

export function useSyncInbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      return (await api.post("/gmail/sync", { timeZone })).data;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
    },
  });
}

export function useDisconnectGmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => api.delete("/gmail"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["gmail-status"] });
    },
  });
}

export function useInsights({ status = "all", enabled = true } = {}) {
  return useQuery({
    queryKey: ["inbox", status],
    queryFn: async () => (await api.get("/inbox", { params: { status } })).data,
    enabled,
  });
}

// Optimistic so ticking a sticky note off feels instant.
export function useUpdateInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => (await api.patch(`/inbox/${id}`, data)).data,
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["inbox"] });
      const snapshots = queryClient.getQueriesData({ queryKey: ["inbox"] });
      queryClient.setQueriesData({ queryKey: ["inbox"] }, (old) =>
        Array.isArray(old) ? old.map((i) => (i._id === id ? { ...i, ...data } : i)) : old
      );
      return { snapshots };
    },
    onError: (_err, _vars, context) => {
      context?.snapshots.forEach(([key, value]) => queryClient.setQueryData(key, value));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["inbox"] }),
  });
}

export function useInsightToTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.post(`/inbox/${id}/task`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useInsightToOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.post(`/inbox/${id}/opportunity`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
