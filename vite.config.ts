import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // process.env does NOT include .env values in this file; loadEnv reads them.
  const env = loadEnv(mode, __dirname, "");

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
      proxy: {
        // Django Account app backend
        "/api": {
          target: env.VITE_API_URL || "http://localhost:8188",
          changeOrigin: true,
          // The backend sets JWTs as httpOnly cookies but authenticates only via
          // the Authorization header — mirror the nginx proxy and bridge the two.
          // bypass() runs before the outgoing request is built, so mutating
          // req.headers here is reliable (proxyReq fires too late in Vite 8).
          bypass(req) {
            if (!req.headers.authorization) {
              const match = /(?:^|;\s*)access_token=([^;]+)/.exec(req.headers.cookie ?? "");
              if (match) {
                req.headers.authorization = `Bearer ${match[1]}`;
              }
            }
          },
        },
      },
    },
  };
});
