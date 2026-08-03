# Account App — Additional API Request: Counselors filtered by Branch

This document requests a small, specific capability the **frontend CRM needs** that is **not yet in the current Account/Users API** (`account_app_apis_guide (2).md`) — even after the branch-scoping work shipped in `be-mds/lead_app_apis_guide (2).md`.

Conventions follow the existing API: `/api/…`, snake_case JSON, integer PKs, DRF pagination (`{count, next, previous, results}`), cookie/JWT auth, same permission model. Where a branch query param is needed we reuse the **existing `branch_id` convention** from Branch Scoping.

---

## Context — what the frontend is building

On the **Lead intake form**, *Branch* and *Assigned counselor* become a dependent pair:

1. The user picks a **Branch** first.
2. The **Assigned counselor** dropdown then lists **only the counselors that belong to the selected branch** — and is disabled until a branch is chosen.

An **admin / staff** user runs this form and can see *all* users across *all* branches, so the client cannot rely on the automatic "non-staff scoped to their own branch" behavior. It must be able to explicitly ask: *"give me the counselors assigned to branch X."*

---

## What already works (no change needed) ✅

Confirmed against the current guides — the client will use these as-is:

| Capability | Endpoint | Status |
|------------|----------|--------|
| Search branches (server-side, debounced) | `GET /api/branches/?search=` (name, code, address) | ✅ shipped |
| Search users (server-side, debounced) | `GET /api/users/?search=` (name, email, designation, phone) | ✅ shipped |
| Create a branch inline from the dropdown | `POST /api/branches/` (`name` + `code` required) | ✅ shipped |
| Branch on leads/students + filter | `branch` FK, `?branch_id=` / `?branch=` | ✅ shipped |
| Users have an "assigned branch" (scoping) | Branch Scoping §, lead guide v2 | ✅ exists internally |

---

## The gap — *Priority: High*

The users endpoint neither **returns** a user's branch nor lets us **filter** users by branch. Branch Scoping (`lead_app_apis_guide (2).md` §Branch Scoping) auto-restricts a *non-staff* requester to *their own* branch, but it explicitly enumerates lead/course/student endpoints — **`/api/users/` is not covered**, and the account guide has no `branch` field or filter at all.

### Request 1 — expose `branch` on the User serializer (read **and write**)

Add to the `/api/users/` **list and detail** responses, and accept it on **write** (see Request 3):

```jsonc
{
  "id": 1,
  "name": "Sita Sharma",
  "email": "sita@skillshikshya.com",
  // …existing fields…
  "branch": 2,                 // FK id (nullable) — the user's assigned branch
  "branch_name": "Pokhara"     // denormalized label (read-only), like assigned_counselor_name elsewhere
}
```

`branch` is a **single FK** (nullable), consistent with "their assigned branch" (singular) in the branch-scoping model. `branch_name` is read-only; `branch` (the id) is writable.

### Request 2 — filter users by branch

Support the existing `branch_id` convention on the users list so an admin can fetch a branch's counselors regardless of the requester's own branch:

```
GET /api/users/?branch_id=2                     → users assigned to branch 2
GET /api/users/?branch_id=2&is_active=true      → active users in branch 2
GET /api/users/?branch_id=2&search=sita         → combine with search
```

For consistency with leads/students, `?branch=2` and `?branch__in=1,2` would be welcome too, but `branch_id` alone unblocks the client.

**Behavior:** the filter should narrow the result set for **any** authorized requester (including staff/admin who otherwise see all users) — it is an explicit query filter, separate from the implicit non-staff scoping.

### Request 3 — **assign** a user to a branch (writable `branch`)

This is the piece that makes the whole cascade usable: an admin must be able to **set / change / clear** a user's branch. Without it, no user ever *has* a branch, so the counselor filter in Request 2 can never return anyone.

Accept `branch` (branch FK id, or `null` to unassign) on:

```
PATCH /api/users/{id}/          { "branch": 2 }      → assign / move to branch 2
PATCH /api/users/{id}/          { "branch": null }   → unassign
POST  /api/auth/register        { …, "branch": 2 }   → set on creation (preferred)
```

- **Permission:** setting another user's branch is a staff/admin action (same gate as `groups` / `is_active`).
- If `branch` **cannot** be accepted at `/auth/register` (as is already the case for `groups`), that's fine — the client will PATCH it immediately after registering, exactly like it does for `groups` today. Please confirm which path you support.
- Invalid/inactive branch id → `400` with a field error on `branch`.

**Client status:** the user create/edit form already sends `branch` (staff-only field, single-select) and shows a Branch column in the users table. It's a no-op until this ships.

---

## Open questions for the backend

1. **Who counts as an "assignable counselor"?** Today the form treats *every* user as a potential counselor. If there is a role/group (e.g. a "Counselor" group) or a flag that marks assignable staff, please expose a filter (e.g. `?group=<id>` already exists, or a boolean) so the dropdown lists only real counselors rather than all users. *If none exists, the client will keep listing all active users in the branch.*

2. **Should `assigned_counselor` be validated against the lead's `branch`?** i.e. must the assigned counselor belong to the lead's selected branch? The client will already enforce this in the UI. Backend validation (reject a counselor whose `branch` ≠ the lead's `branch`) would be a nice safety net but is **optional** — please confirm whether you want to add it so the client can surface the right error message.

3. **Multi-branch users** — confirmed out of scope? The current model is one branch per user (FK). If a counselor can ever serve multiple branches, we'd need M2M + the filter to match "any of." Assuming **single FK** unless told otherwise.

---

## Acceptance (client's definition of done)

- `GET /api/users/` returns `branch` and `branch_name` on every user row.
- `PATCH /api/users/{id}/` with `{ "branch": <id|null> }` assigns / clears the user's branch (staff-only), and it round-trips on the next GET.
- `GET /api/users/?branch_id=X` returns exactly the users whose assigned branch is `X` (for a staff/admin caller), paginated, and composes with `search` / `is_active`.
- (If Q1 applies) a documented way to restrict the list to assignable counselors.

Until this ships, the frontend will fall back to listing **all** users in the counselor dropdown (unfiltered by branch) on the live path.
