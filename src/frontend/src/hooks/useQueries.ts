import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Product,
  UserProfile,
  VerificationLog,
  VerificationResult,
} from "../backend.d";
import { useActor } from "./useActor";

export function useListProducts() {
  const { actor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listProducts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerificationHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<VerificationLog[]>({
    queryKey: ["verificationHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerificationHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isCallerAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, UserProfile>({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useInitialize() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not ready");
      return actor.initialize();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useVerifyProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<VerificationResult, Error, string>({
    mutationFn: async (searchTerm: string) => {
      if (!actor) throw new Error("Actor not ready");
      const result = await actor.verifyProduct(searchTerm);
      await actor.recordVerification(searchTerm, result.status).catch(() => {});
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["verificationHistory"] });
    },
  });
}

export function useRegisterProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, Product>({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.registerProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, Product>({
    mutationFn: async (product: Product) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateProduct(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useRemoveProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (productId: string) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.removeProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
