import axios, { AxiosError, type AxiosRequestConfig } from "axios";

// Auth uses httpOnly cookies set by the backend; the browser attaches them
// automatically. In dev, Vite proxies /api to the Django server; in Docker,
// nginx does the same — so requests are always same-origin.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let refreshPromise: Promise<void> | null = null;

async function refreshAccessToken() {
  refreshPromise ??= axios
    .post("/api/auth/refresh/", {}, { withCredentials: true })
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
  const url = original?.url ?? "";
  const isAuthEndpoint = url.includes("/auth/");

  if (error.response?.status === 401 && original && !original._retried && !isAuthEndpoint) {
    try {
      await refreshAccessToken();
      original._retried = true;
      return api.request(original);
    } catch {
      window.dispatchEvent(new Event("auth:logout"));
    }
  }
  return Promise.reject(error);
});

/** Extract a human-readable message from a DRF error response. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const d = data as Record<string, unknown>;
      for (const key of ["detail", "message", "error"]) {
        if (typeof d[key] === "string") return d[key] as string;
      }
      // Field errors: {"email": ["user with this email already exists."]}
      const parts: string[] = [];
      for (const [field, value] of Object.entries(d)) {
        const text = Array.isArray(value) ? value.join(" ") : String(value);
        parts.push(field === "non_field_errors" ? text : `${field}: ${text}`);
      }
      if (parts.length) return parts.join(" · ");
    }
    if (error.message) return error.message;
  }
  return fallback;
}
