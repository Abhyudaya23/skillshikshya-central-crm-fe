import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { callMinutesService } from "@/services/call-minutes.service";
import type {
  AddCallMinutesPayload,
  CallMinutesTransactionType,
  CallMinutesTransactionsParams,
} from "@/types/call-minutes";

/** Admin-only paginated ledger for one user. */
export function useCallMinutesTransactions(
  userId: number | null,
  page = 1,
  type?: CallMinutesTransactionType,
) {
  return useQuery({
    queryKey: ["call-minutes", "transactions", userId, page, type ?? null],
    queryFn: () => {
      const params: CallMinutesTransactionsParams = { page, page_size: 10 };
      if (type) params.type = type;
      return callMinutesService.transactions(userId as number, params);
    },
    enabled: userId != null,
    placeholderData: keepPreviousData,
  });
}

/** Own balance + last 10 transactions (GET /users/me/call-minutes/). */
export function useMyCallMinutes() {
  return useQuery({
    queryKey: ["call-minutes", "me"],
    queryFn: () => callMinutesService.myBalance(),
    staleTime: 30 * 1000,
  });
}

/** Admin-only top-up. Invalidates the users list (balance field) and any ledger. */
export function useAddCallMinutes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: AddCallMinutesPayload }) =>
      callMinutesService.add(userId, payload),
    onSuccess: (data) => {
      toast.success(data.detail || `Added ${data.transaction.amount} minutes`);
      void qc.invalidateQueries({ queryKey: ["users"] });
      void qc.invalidateQueries({ queryKey: ["call-minutes"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Top-up failed")),
  });
}
