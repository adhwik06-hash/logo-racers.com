import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCarBrand, type InsertScore } from "@shared/routes";

// ============================================
// GAME DATA HOOKS
// ============================================

export function useBrands(difficulty?: 'easy' | 'medium' | 'hard' | 'impossible', limit?: number) {
  return useQuery({
    queryKey: [api.brands.list.path, difficulty, limit],
    queryFn: async () => {
      // Use buildUrl or construct manually if query params need special handling
      const url = new URL(api.brands.list.path, window.location.origin);
      if (difficulty) url.searchParams.append('difficulty', difficulty);
      if (limit) url.searchParams.append('limit', limit.toString());
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch car brands");
      return api.brands.list.responses[200].parse(await res.json());
    },
    // Randomize or specific logic is handled by backend usually, 
    // but for a game we want fresh data if we restart.
    staleTime: 0, 
    refetchOnWindowFocus: false,
  });
}

// For seeding or adding new brands (Admin feature essentially)
export function useCreateBrand() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCarBrand) => {
      const res = await fetch(api.brands.create.path, {
        method: api.brands.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create brand");
      return api.brands.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.brands.list.path] }),
  });
}

// ============================================
// SCORE HOOKS
// ============================================

export function useScores() {
  return useQuery({
    queryKey: [api.scores.list.path],
    queryFn: async () => {
      const res = await fetch(api.scores.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch scores");
      return api.scores.list.responses[200].parse(await res.json());
    },
  });
}

export function useSubmitScore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertScore) => {
      const res = await fetch(api.scores.create.path, {
        method: api.scores.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit score");
      return api.scores.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.scores.list.path] }),
  });
}
