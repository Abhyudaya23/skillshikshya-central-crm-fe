# Lead App — Additional API Request: global (cross-lead) list endpoints

> **Update (2026-07-22): ✅ SHIPPED.** All three endpoints are live (see `be-mds/lead_app_global_list_api_guide.md`) and wired on the frontend — `/follow-ups` (with inline Complete), `/enrollments`, and `/payments` now run on the real endpoints.

This document requests **three flat, read-only list endpoints** so the frontend can build cross-lead workspace pages (`/follow-ups`, `/enrollments`, `/payments`). Today these records exist **only nested under a lead**, which makes a system-wide view impossible without N+1 fan-out.

Conventions follow the existing Lead API (`app_documents/lead_app_*.md`): `/api/…`, snake_case JSON, integer PKs, DRF pagination (`{count, page_size, total_pages, current_page, next, previous, results}`), cookie/JWT auth, branch scoping (`?branch_id=`), same permission model.

---

## Context — why nested-only blocks these pages

| Resource | Current (nested) endpoint | Global view needed for |
|----------|---------------------------|------------------------|
| Follow-ups | `/api/leads/{lead_id}/followups/` | A queue of everyone's follow-ups by due date / assignee |
| Enrollments | `/api/leads/{lead_id}/enrollments/` | An enrollments register across all leads |
| Payments | `/api/leads/{lead_id}/enrollments/{enrollment_id}/payments/` | A payments ledger across all leads |

The leads list only exposes `next_followup_at` (a weak proxy we currently use for the interim follow-ups page); it carries **no** enrollment or payment data. Listing these globally today would require one request per lead (and per enrollment for payments) — not viable.

**Keep the nested endpoints** — they're correct for creating/editing within a lead (the lead-detail tabs use them). These new endpoints are **read + filter only** (list, and optionally retrieve); all writes stay on the nested routes.

---

## Request 1 — `GET /api/followups/` — *Priority: Medium*

A flat list of follow-ups across all leads. Nested create/update/delete stays as-is.

**Each row** (denormalize the lead for display):
```jsonc
{
  "id": 12,
  "lead": 1,
  "lead_name": "Rahul Sharma",
  "lead_phone": "9812345678",
  "assigned_to": 3,
  "assigned_to_name": "Sita Sharma",
  "scheduled_at": "2026-07-25T10:00:00Z",
  "purpose": "Discuss pricing",
  "status": "pending",
  "branch": 1,
  "branch_name": "Kathmandu"
}
```

**Filters / ordering:** `status`, `assigned_to`, `branch_id`, `scheduled_at__gte`, `scheduled_at__lte`, `ordering=scheduled_at` (and `-scheduled_at`), pagination.

**Examples:**
```
GET /api/followups/?status=pending&ordering=scheduled_at
GET /api/followups/?assigned_to=3&scheduled_at__lte=2026-07-31T23:59:59Z
GET /api/followups/?branch_id=1&status=pending
```

---

## Request 2 — `GET /api/enrollments/` — *Priority: Medium*

A flat enrollments register. Nested create/update/delete stays as-is.

**Each row** (include the computed money fields already on the nested detail):
```jsonc
{
  "id": 5,
  "lead": 1,
  "lead_name": "Rahul Sharma",
  "student": 9,
  "student_name": "Rahul Sharma",
  "course": 2,
  "course_name": "Python Advanced",
  "batch": "PY-2026-01",
  "status": "active",
  "enrollment_date": "2026-07-20",
  "listed_fee": "50000.00",
  "agreed_amount": "45000.00",
  "total_paid": "20000.00",
  "remaining_amount": "25000.00",
  "is_full_paid": false,
  "branch": 1,
  "branch_name": "Kathmandu",
  "created_at": "2026-07-20T10:00:00Z"
}
```

**Filters / ordering:** `status`, `course`, `branch_id`, `lead`, `is_full_paid`, `enrollment_date__gte/lte`, `ordering` (`enrollment_date`, `agreed_amount`, `remaining_amount`, `created_at`), pagination.

**Examples:**
```
GET /api/enrollments/?status=active&ordering=-created_at
GET /api/enrollments/?is_full_paid=false&branch_id=1
GET /api/enrollments/?course=2&enrollment_date__gte=2026-07-01
```

---

## Request 3 — `GET /api/payments/` — *Priority: Medium*

A flat payments ledger. Recording a payment stays on the nested route.

**Each row** (denormalize enrollment + lead for the ledger):
```jsonc
{
  "id": 88,
  "enrollment": 5,
  "lead": 1,
  "lead_name": "Rahul Sharma",
  "course_name": "Python Advanced",
  "amount": "20000.00",
  "payment_date": "2026-07-21T14:30:00Z",
  "payment_method": "esewa",
  "transaction_reference": "ESW-99213",
  "status": "successful",
  "received_by_name": "Sita Sharma",
  "branch": 1,
  "branch_name": "Kathmandu"
}
```

**Filters / ordering:** `status`, `payment_method`, `branch_id`, `enrollment`, `lead`, `payment_date__gte/lte`, `ordering=payment_date` (and `-payment_date`, `amount`), pagination.

**Examples:**
```
GET /api/payments/?status=successful&ordering=-payment_date
GET /api/payments/?payment_method=esewa&payment_date__gte=2026-07-01T00:00:00Z
GET /api/payments/?branch_id=1
```

A summary total on the list response (e.g. `total_amount` for the current filter) would be a nice-to-have for the ledger header, but is optional — the client can sum the page otherwise.

---

## Notes for the backend

- **Read-only.** No create/update on these flat routes — writes remain on the nested endpoints. `POST`/`PATCH`/`DELETE` can 405.
- **Branch scoping** applies as everywhere else: non-staff auto-scoped to their branch; staff/admin can pass `?branch_id=`.
- **Permissions:** reuse `lead.view_followup` / `lead.view_enrollment` / `lead.view_payment`.
- Same pagination envelope as `/api/leads/`.

## Acceptance (client's definition of done)

- `GET /api/followups/`, `/api/enrollments/`, `/api/payments/` each return a paginated, filterable, denormalized flat list.
- The filters/orderings listed above work and compose with `branch_id`.
- Nested create/edit endpoints continue to work unchanged.

Until these ship: `/follow-ups` runs on the leads-list `next_followup_at` proxy (one per lead), and `/enrollments` + `/payments` are deferred (no viable proxy on the leads list).
