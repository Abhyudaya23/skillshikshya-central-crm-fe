import { api } from "@/lib/api";
import type { OrbitChatSyncState, OrbitChatSyncStatePatch } from "@/types/orbitchat";

/**
 * OrbitChat hourly lead-sync toggle — admin only (`is_staff`).
 * Disabling takes effect on the next hourly tick; no restart needed.
 */
export const orbitchatService = {
  async getSyncState() {
    const { data } = await api.get<OrbitChatSyncState>("/orbitchat/sync-state/");
    return data;
  },

  async updateSyncState(payload: OrbitChatSyncStatePatch) {
    const { data } = await api.patch<OrbitChatSyncState>("/orbitchat/sync-state/", payload);
    return data;
  },
};
