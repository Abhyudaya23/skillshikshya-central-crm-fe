import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { leadsService } from "@/services/leads.service";
import type { ApiLead } from "@/types/leads-api";
import type { ComboboxOption } from "@/components/ui/combobox";

/** Server-searched lead options for inline pickers (`?search=` + page_size). */
export function useLeadOptions(search: string, extraParams: Record<string, unknown> = {}) {
  const debounced = useDebouncedValue(search, 300);
  const query = useQuery({
    queryKey: ["leads", "picker", debounced, extraParams],
    queryFn: () =>
      leadsService.list({ search: debounced || undefined, page_size: 20, ...extraParams }),
    placeholderData: keepPreviousData,
  });
  const options: ComboboxOption[] = useMemo(
    () =>
      (query.data?.results ?? []).map((l: ApiLead) => ({
        value: String(l.id),
        label: [l.full_name, l.phone].filter(Boolean).join(" · "),
      })),
    [query.data],
  );
  return { options, isLoading: query.isFetching };
}
