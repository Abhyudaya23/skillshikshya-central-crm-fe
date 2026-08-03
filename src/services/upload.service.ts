import { api } from "@/lib/api";
import type { ApiUpload } from "@/types/leads-api";

export const uploadService = {
  /** Upload a file to R2 via the global endpoint; returns the stored public URL. */
  async upload(file: File, folder = "uploads") {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const { data } = await api.post<ApiUpload>("/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};
