# SkillShikshya Central CRM — Frontend

React frontend for SkillShikshya Central CRM (counseling & sales operations).

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 (CSS-first config) + shadcn-style components
- React Router, TanStack Query, Axios
- Auth via the Django **Account app** backend (`http://localhost:8188`) using httpOnly JWT cookies

## Modules

| Route | Status |
|-------|--------|
| `/` Dashboard | Live — team stats from the users API |
| `/users` | Live — full CRUD (register, edit role/targets/shift/work-days, delete) |
| `/roles` | Live — admin-only role groups + permission assignment |
| `/leads`, `/calls`, `/call-minutes` | Placeholder — waiting on backend APIs |

## Development

Backend must be running at `http://localhost:8188` (Vite proxies `/api` to it).

```bash
npm install
npm run dev   # http://localhost:5173
```

Override the backend URL with `VITE_API_URL=http://other-host:8188 npm run dev`.

## Docker

```bash
docker compose up --build   # serves at http://localhost:5173
```

The nginx inside the container proxies `/api/` to `host.docker.internal:8188`.
When the backend joins the same compose network, change `proxy_pass` in
`nginx.conf` to the API service name.
