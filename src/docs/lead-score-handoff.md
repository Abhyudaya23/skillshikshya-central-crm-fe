# Lead App — Additional API Request: compute `lead_score`

This document requests that the backend **compute and populate `lead_score`**, which today exists on the model but is never set (every live lead reads `0`).

Conventions follow the existing Lead API (`be-mds/lead_app_apis_guide (2).md`): `/api/…`, snake_case JSON, integer PKs, DRF pagination, cookie/JWT auth, same permission model.

---

## Context — current state

`lead_score` is already:
- **Returned** on list + detail (`"lead_score": 0`).
- **Filterable / sortable**: `?lead_score__gte=`, `?lead_score__lte=`, `ordering=lead_score`.
- **Read-only** — it is *not* accepted in the create/update payload, and the frontend never sends it.

But there is **no documented computation**, so the field defaults to `0` for every lead. The UI shows a 0–100 score bar that is consequently flat everywhere on the live path.

**Intended meaning (frontend):** an *engagement / qualification score, 0–100, derived from status + priority + recency*. We want the backend to own this — it should stay **read-only** on the API (no client input), and the frontend needs **zero changes** once it's populated.

---

## Request — server-side scoring — *Priority: Medium*

Compute `lead_score` as an integer **0–100** from signals the backend already has. Recompute it on the lifecycle events listed below and persist it on the lead.

### Proposed formula (weights are tunable — treat as a starting point)

A weighted sum of five components, clamped to `[0, 100]`:

| Component | Max pts | Basis (data already on the model) |
|-----------|:------:|-----------------------------------|
| **Status progression** | 35 | How far down the pipeline. Scale by `lead_statuses.sort_order` between the first non-final status and the last. `enrolled`/won → full 35; `lost`/`not_interested`/`invalid` (any `is_final` "negative") → 0 for this component. |
| **Priority** | 25 | Map the assigned priority: Hot → 25, Warm → 17, Cool → 9, Cold → 3, none → 0. (Use `priority.sort_order` if names aren't fixed.) |
| **Recency of contact** | 20 | From `last_contact_at`: ≤3 days → 20, ≤7 → 15, ≤14 → 10, ≤30 → 5, older / never → 0. |
| **Engagement** | 15 | Activity volume: `call_count` + logged activities. e.g. `min(15, calls*3 + activities*1)`. |
| **Follow-up discipline** | 5 | A pending (not missed) follow-up scheduled in the future → 5; overdue/missed → 0. |

`lead_score = round(clamp(sum, 0, 100))`.

**Negative-terminal override:** if the lead is in a final "lost/not-interested/invalid/duplicate" status, force `lead_score = 0` regardless of the components (a dead lead shouldn't score high on old activity).

**Converted leads:** if `is_converted` / enrolled, `lead_score = 100`.

### When to recompute

Recompute and save on any of:
- Lead **create** and **update** (status/priority/assignment/contact changes).
- A **call**, **activity**, or **follow-up** is added or its status changes.
- `last_contact_at` changes.

A nightly job (or on-read recompute) to decay the recency component is nice-to-have but not required — recomputing on the events above is enough for the UI.

---

## API behavior (unchanged from today)

- `lead_score` stays **read-only** — keep rejecting/ignoring it in the create/update payload.
- Keep it in list + detail responses and keep the existing `lead_score__gte/lte` filters and `ordering=lead_score`.

No new endpoints. No frontend changes: the score bar and any "hot leads" sorting light up automatically once the field is populated.

---

## Open questions for the backend

1. **Weights & buckets** — are the numbers above acceptable, or do you have a preferred scheme? They're all tunable; the frontend doesn't care about the exact formula, only that the result is a stable 0–100 integer.
2. **Recency source** — is `last_contact_at` reliably set (from calls/activities)? If not, which timestamp should drive the recency component?
3. **Recompute strategy** — event-driven on save/activity (preferred) vs. computed-on-read vs. a periodic job. Any of these is fine for the client.

---

## Acceptance (client's definition of done)

- New and existing leads return a **non-zero, meaningful** `lead_score` reflecting their status/priority/recency/engagement.
- The value updates after a status change, a logged call, or a new follow-up.
- Final "lost"-type leads read `0`; enrolled/converted leads read `100`.
- `lead_score` remains read-only; `?ordering=-lead_score` returns the hottest leads first.
