# Lead App — Additional API Requests (Frontend → Backend)

This document lists capabilities the **frontend CRM needs** that are **not yet in the current Lead API** (`be-mds/lead_app_apis_guide.md`). Every item here is backed by the two source-of-truth references:

- `CRM Lead Management System Plan (1).docx` — the agreed data model.
- `New Responses _ SkillShikshya X Vrit Tech Courses Form (1).xlsx` — the **real operational data** the team tracks today.

Conventions follow the existing Lead API: `/api/…`, snake_case JSON, integer PKs, DRF pagination (`{count, next, previous, results}`), cookie/JWT auth, and the same permission model (`staff` or `lead.*` Django perms).

Until these ship, the frontend hides the corresponding UI on the **live** data path and shows the full design only on the **mock** data toggle.

---

## 1. Lead custom / type-specific fields  — *Priority: High*

**Why:** The `AllCourses`, `Website Lead`, and `SEE Lead` sheets carry per-lead attributes that don't fit fixed columns: *"How do you wish to take this course?"*, *"Preferred Shift"*, *"most feasible timing"*, *"Do you have a laptop?"*, *"College / Institution Name"*, *"Grade"*, *"How long Course do you prefer"*, *"Emergency Contact Number"*, *"referrals"*. The plan (§1.13–1.14) specifies a controlled `custom_data` JSONB.

**Request:** add a JSONB field on `Lead`:

```
custom_data  JSONB  NOT NULL DEFAULT '{}'
```

Returned as-is on detail/list and writable on create/update. Suggested keys (snake_case, controlled values):

| Key | Type | Values |
|-----|------|--------|
| `preferred_learning_mode` | string | `online`, `office`, `hybrid`, `undecided` |
| `preferred_shift` | string | `morning`, `day`, `evening`, `weekend`, `flexible` |
| `preferred_timing` | string | free text (e.g. `18:00-20:00`) |
| `preferred_course_duration` | string | e.g. `3_months`, `6_months`, `flexible` |
| `has_laptop` | bool\|null | `true` / `false` / `null` (unknown) |
| `institution_name` | string | free text |
| `education_level` | string | `see`, `plus_two`, `diploma`, `bachelors`, `masters`, `other` |
| `emergency_contact` | object | `{ name, phone, relationship }` |
| `referral` | object | `{ code, referred_by_name, referred_by_phone, notes }` |

Optionally expose a per-`lead_type` form schema (plan §1.14) so the client can render dynamic fields, but the client can also hardcode the above for now.

---

## 2. Multiple course interests  — *Priority: Medium*

**Why:** The plan (§1.6) defines `lead_course_interests`, and the `Interested-All-Courses` sheet shows leads considering more than one course. The current API only has a single `primary_course` FK.

**Request:** a nested collection on the lead (mirrors calls/activities):

```
GET    /api/leads/{lead_id}/course-interests/
POST   /api/leads/{lead_id}/course-interests/
PATCH  /api/leads/{lead_id}/course-interests/{id}/
DELETE /api/leads/{lead_id}/course-interests/{id}/
```

**Fields:** `id`, `course` (FK), `course_name` (read), `is_primary` (bool), `interest_level` (`high`|`medium`|`low`), `created_at`.

Keep the existing `primary_course` on the lead as a denormalized convenience (set to the `is_primary` row), or drop it in favour of this collection — either is fine for the client.

---

## 3. Enrollment  — *Priority: High*

**Why:** The workbook tracks enrollment per lead: `Batch`, `Full Amount`, `One time Payment Discount`, `Additional Discount`, `Enrollment Status`, `Enrollment Date`. Plan §1.11. The current `Student` app records a student but not the commercial enrollment terms.

**Request:** an enrollment entity linked to the lead (and optionally the resulting student):

```
GET  /api/leads/{lead_id}/enrollments/
POST /api/leads/{lead_id}/enrollments/
GET/PATCH/DELETE /api/leads/{lead_id}/enrollments/{id}/
```

**Fields:** `id`, `lead` (FK, from URL), `student` (FK, nullable), `course` (FK), `course_name` (read), `batch` (string), `enrollment_date` (date), `status` (`pending`|`confirmed`|`active`|`completed`|`cancelled`|`dropped_out`|`transferred`), `listed_fee` (decimal), `standard_discount` (decimal), `additional_discount` (decimal), `agreed_amount` (decimal), `remarks`, `created_by` (read), `created_at`, `updated_at`.

Also expose a computed `enrollment_summary` on the lead detail (plan §1.11):
```json
{ "is_enrolled": true, "latest_status": "active", "course": "UI/UX Design", "batch": "UIUX-2083-01" }
```

---

## 4. Payments  — *Priority: High*

**Why:** Workbook columns `Paid Amount`, `Remaining Amount`, `Paid Status`, plus plan §1.12. Amounts must be **derived from transactions**, never hand-edited.

**Request:** payments nested under an enrollment:

```
GET  /api/leads/{lead_id}/enrollments/{enrollment_id}/payments/
POST /api/leads/{lead_id}/enrollments/{enrollment_id}/payments/
GET/DELETE …/payments/{id}/
```

**Fields:** `id`, `enrollment` (FK), `amount` (decimal), `payment_date` (datetime), `payment_method` (`cash`|`esewa`|`khalti`|`bank_transfer`|`card`|`connectips`), `transaction_reference`, `status` (`pending`|`successful`|`failed`|`refunded`|`voided`), `received_by` (read), `notes`, `created_at`.

**Computed on the enrollment** (do not accept from client): `total_paid = SUM(successful)`, `remaining_amount = agreed_amount - total_paid`, `is_full_paid = remaining <= 0`.

---

## 5. Soft-delete, Archive & Recycle Bin  — *Priority: High*

**Why:** Plan §1.2 mandates soft deletion, recovery, auditability, and admin-only permanent purge. The current API only hard-deletes.

**Request:**

- Add to `Lead`: `is_archived` (bool, default false), `is_deleted` (bool, default false), `deleted_at`, `deleted_by`.
- List `/api/leads/` excludes archived and deleted by default; support `?is_archived=true` and an `?include_archived=true` toggle.
- Actions:
  ```
  POST /api/leads/{id}/archive/     → is_archived = true      (perm: lead.change_lead)
  POST /api/leads/{id}/restore/     → is_archived = false
  DELETE /api/leads/{id}/           → soft delete (is_deleted = true)   (perm: lead.delete_lead)
  ```
- Recycle bin: `GET /api/leads/recycle-bin/` (deleted rows), `POST /api/leads/{id}/purge/` for permanent deletion (staff/admin only).

The frontend currently keeps **Archive** as a non-persisting placeholder until this ships.

---

## 6. Human-readable reference number  — *Priority: Medium*

**Why:** Plan §1.2 — staff need a readable, searchable, non-sequential-looking id (`LD-2026-000001`). The `Student` app already does this (`STU-2026-0001`).

**Request:** add `reference_number` (string, unique, auto-generated `LD-{YEAR}-{seq:06d}`) to `Lead`. Read-only, included in list + detail, and searchable via `?search=`.

---

## 7. Status & assignment history  — *Priority: Low (partially covered)*

The lead timeline is currently derived client-side from `LeadActivity` rows of type `status_change` / `assignment_change`. That's sufficient for now. If dedicated audit is wanted later (plan §1.16–1.17), expose read-only `GET /api/leads/{id}/status-history/` and `…/assignment-history/`.

---

## 8. Deferred (not needed for this phase)

Documented for completeness; frontend has placeholders only:

- **Duplicate detection** (plan §1.18) — strong/possible match warnings on create, merge with audit.
- **Bulk operations** — `POST /api/leads/bulk-assign/`, `POST /api/leads/bulk-archive/` (client currently loops or hides).
- **Saved views** — persisted filter presets per user.
- **Public web-form intake** — unauthenticated create for website lead capture.

---

## Summary for the client (current wiring)

> **Update:** the backend shipped every item in this document (see `lead_app_apis_guide (1).md`). All are now wired on the live path.

| Area | Live API | Frontend behaviour |
|------|----------|--------------------|
| Leads CRUD, calls, activities, followups, documents, tags | ✅ | Fully wired |
| Config (sources/campaigns/statuses/priorities/tags) | ✅ | Settings CRUD wired |
| Branches, Students, Convert-to-student, Upload | ✅ | Wired |
| Custom fields (`custom_data`) | ✅ | Captured in the form, shown on lead detail |
| Multiple course interests | ✅ | Read on detail (adapter); primary set via form |
| Enrollment + Payments | ✅ | Enrollment/Payments tabs + create-enrollment & record-payment dialogs |
| Soft-delete + archive / restore / recycle-bin | ✅ | Archive/Restore + soft Delete wired; `include_archived` filter |
| Reference number (`LD-YYYY-NNNNNN`) | ✅ | Shown on list + detail; searchable |
