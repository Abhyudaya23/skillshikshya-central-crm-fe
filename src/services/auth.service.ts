import { api } from "@/lib/api";
import type {
  ChangePasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from "@/types";

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<{ message: string; user: User }>("/auth/login/", payload);
    return data;
  },

  async register(payload: RegisterPayload) {
    const { data } = await api.post<{ message: string; user: User }>("/auth/register/", payload);
    return data;
  },

  async logout() {
    const { data } = await api.post<{ message: string }>("/auth/logout/", {});
    return data;
  },

  async changePassword(payload: ChangePasswordPayload) {
    const { data } = await api.post<{ detail: string }>("/auth/change-password/", payload);
    return data;
  },

  /** Sends a signed reset link to the email. In DEBUG mode the backend echoes it as `reset_link`. */
  async forgotPassword(email: string) {
    const { data } = await api.post<{ detail: string; reset_link?: string }>(
      "/auth/forgot-password/",
      { email },
    );
    return data;
  },

  /** Resets the password using uid + token from the emailed link's query params. */
  async resetPassword(payload: ResetPasswordPayload) {
    const { data } = await api.post<{ detail: string }>("/auth/reset-password/", payload);
    return data;
  },
};
