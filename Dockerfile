# --- Frontend build + static serve ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime
# Template form: the nginx entrypoint runs envsubst on /etc/nginx/templates/*
# at startup, so ${VITE_API_URL} in nginx.conf is filled from container env.
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
