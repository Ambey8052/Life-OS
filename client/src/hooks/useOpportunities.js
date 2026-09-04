import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export function useOpportunities(filters = {}) {
  return useQuery({
    queryKey: ["opportunities", filters],
    queryFn: async () => {
      const res = await api.get("/opportunities", { params: filters });
      return res.data;
    },
  });
}

export function useDashboardToday() {
  return useQuery({
    queryKey: ["dashboard", "today"],
    queryFn: async () => {
      const res = await api.get("/dashboard/today");
      return res.data;
    },
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => (await api.post("/opportunities", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => (await api.patch(`/opportunities/${id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/opportunities/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useSetCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, password }) => api.post(`/opportunities/${id}/credential`, { password }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}

export function useRevealCredential() {
  return useMutation({
    mutationFn: async (id) => (await api.get(`/opportunities/${id}/credential/reveal`)).data.password,
  });
}

export function useDeleteCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => api.delete(`/opportunities/${id}/credential`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["opportunities"] }),
  });
}
