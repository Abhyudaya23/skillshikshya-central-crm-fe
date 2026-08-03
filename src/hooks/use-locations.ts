import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { locationService } from "@/services/location.service";

export function useProvinces(search = "", enabled = true) {
  return useQuery({
    queryKey: ["provinces", search],
    queryFn: () => locationService.provinces({ search: search || undefined, page_size: 100 }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCities(provinceId?: number, search = "", enabled = true) {
  return useQuery({
    queryKey: ["cities", provinceId ?? null, search],
    queryFn: () =>
      locationService.cities({ province: provinceId, search: search || undefined, page_size: 100 }),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}
