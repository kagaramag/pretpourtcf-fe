import type {
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useMutation, useQuery } from "@tanstack/react-query"

export const useFetch = <T>(
  key: QueryKey,
  queryFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T>, "queryFn">
): UseQueryResult<T> => {
  return useQuery({
    queryKey: key,
    queryFn,
    ...options,
  })
}

export const useMutate = <T, V>(
  mutationFn: (data: V) => Promise<T | null>,
  options?: Omit<UseMutationOptions<T | null, Error, V, unknown>, "mutationFn">
): UseMutationResult<T | null, Error, V, unknown> => {
  return useMutation({
    mutationFn,
    ...options,
  })
}
