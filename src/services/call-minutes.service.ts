import { api } from "@/lib/api";
import type { Paginated } from "@/types";
import type {
  AddCallMinutesPayload,
  AddCallMinutesResponse,
  CallMinutesTransaction,
  CallMinutesTransactionsParams,
  MyCallMinutes,
} from "@/types/call-minutes";

export const callMinutesService = {
  /** Admin-only: top up a user's call minutes balance. */
  async add(userId: number, payload: AddCallMinutesPayload) {
    const { data } = await api.post<AddCallMinutesResponse>(
      `/users/${userId}/call-minutes/add/`,
      payload,
    );
    return data;
  },

  /** Admin-only: paginated ledger for a user. */
  async transactions(userId: number, params: CallMinutesTransactionsParams = {}) {
    const { data } = await api.get<Paginated<CallMinutesTransaction>>(
      `/users/${userId}/call-minutes/transactions/`,
      { params },
    );
    return data;
  },

  /** Own balance + last 10 transactions. */
  async myBalance() {
    const { data } = await api.get<MyCallMinutes>("/users/me/call-minutes/");
    return data;
  },
};
