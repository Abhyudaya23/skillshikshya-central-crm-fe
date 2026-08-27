/**
 * OrbitChat lead-sync state — see the §OrbitChat Lead Sync section of
 * lead_app_overview.md (backend: apps/app_documents/lead_app_overview.md).
 */

/** GET/PATCH /api/orbitchat/sync-state/ — admin-only singleton sync toggle. */
export interface OrbitChatSyncState {
  key: string;
  is_enabled: boolean;
  last_sync_at: string | null;
  updated_at: string;
}

export interface OrbitChatSyncStatePatch {
  is_enabled: boolean;
}
