import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/lib/api";
import { orbitchatService } from "@/services/orbitchat.service";
import type { OrbitChatSyncStatePatch } from "@/types/orbitchat";

export function useOrbitChatSyncState(enabled = true) {
  return useQuery({
    queryKey: ["orbitchat-sync-state"],
    queryFn: () => orbitchatService.getSyncState(),
    enabled,
  });
}

export function useUpdateOrbitChatSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrbitChatSyncStatePatch) => orbitchatService.updateSyncState(payload),
    onSuccess: (data) => {
      toast.success(data.is_enabled ? "OrbitChat sync enabled" : "OrbitChat sync disabled");
      void qc.invalidateQueries({ queryKey: ["orbitchat-sync-state"] });
    },
    onError: (e) => toast.error(apiErrorMessage(e, "Could not update OrbitChat sync setting")),
  });
}
