import { api } from "@/lib/api";
import type { ChangePasswordPayload, LoginPayload, RegisterPayload, User } from "@/types";

export const authService = {
  async login(payload: LoginPayload) {
    const { data } = await api.post<{ message: string }>("/auth/login/", payload);
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

  async forgotPassword(email: string) {
    const { data } = await api.post<{ detail: string }>("/auth/forgot-password/", { email });
    return data;
  },

  async verifyOtp(email: string, otp: string) {
    const { data } = await api.post<{ detail: string }>("/auth/verify-otp/", { email, otp });
    return data;
  },

  async resetPassword(email: string, new_password: string, confirm_new_password: string) {
    const { data } = await api.post<{ detail: string }>("/auth/reset-password/", {
      email,
      new_password,
      confirm_new_password,
    });
    return data;
  },
};
