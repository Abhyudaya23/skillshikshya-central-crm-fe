/**
 * Backend wire types — mirror the live API exactly (snake_case, integer PKs)
 * as documented in `docs/be-mds/*`. These are what services send/receive;
 * `data/lead-adapters.ts` maps them to the rich UI model in `types/leads.ts`.
 *
 * Fields the BE does not yet provide (see `docs/lead-additional.md`) are typed
 * optional so the client is forward-compatible when they ship.
 */

export type ApiLeadType = "course_inquiry" | "master_class" | "corporate" | "general_inquiry";

/* ------------------------------------------------------------- config lookups */

export interface ApiLeadSource {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
}

export interface ApiCampaign {
  id: number;
  name: string;
  source: number | null;
  source_name?: string;
  start_date?: string | null;
  end_date?: string | null;
  budget?: string | null;
  is_active: boolean;
}

export interface ApiLeadStatus {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  is_final: boolean;
  is_active: boolean;
}

export interface ApiLeadPriority {
  id: number;
  name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface ApiLeadTag {
  id: number;
  name: string;
  color: string;
  is_active: boolean;
}

/** Lead type is a FK lookup on the live backend (`/api/lead-types/`). */
export interface ApiLeadTypeConfig {
  id: number;
  name: string;
  code?: string;
  sort_order?: number;
  is_active?: boolean;
}

/* --------------------------------------------------------------------- lead */

export interface ApiLeadNextFollowup {
  id: number;
  scheduled_at: string;
  purpose: string;
  assigned_to: number;
  assigned_to_name: string;
}

export interface ApiEnrollmentSummary {
  is_enrolled: boolean;
  latest_status: string | null;
  course: string | null;
  batch: string | null;
}

export interface ApiLead {
  id: number;
  /** Future — see lead-additional.md §6. */
  reference_number?: string | null;
  full_name: string;
  phone: string;
  secondary_phone: string | null;
  email: string | null;
  address: string | null;
  /** Numeric FK id on the live backend; legacy string enum on older builds. */
  lead_type: number | ApiLeadType | null;
  lead_type_name?: string;
  lead_score: number;
  expected_revenue: string | null;
  next_followup_at: string | null;
  last_contact_at: string | null;
  notes: string | null;
  is_converted: boolean;
  converted_at: string | null;
  is_archived?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: number | null;
  created_at: string;
  updated_at: string;

  // location
  province?: number | null;
  province_name?: string;
  city?: number | null;
  city_name?: string;
  landmark?: string | null;
  heard_from?: string | null;

  // FK ids
  source: number | null;
  campaign: number | null;
  branch: number | null;
  priority: number | null;
  status: number | null;
  assigned_counselor: number | null;
  primary_course: number | null;
  created_by: number | null;
  updated_by: number | null;
  tags: number[];

  custom_data?: Record<string, unknown>;
  enrollment_summary?: ApiEnrollmentSummary | null;

  // denormalized read-only labels (present on detail; may be partial on list)
  status_name?: string;
  status_color?: string;
  priority_name?: string;
  priority_color?: string;
  source_name?: string;
  campaign_name?: string;
  primary_course_name?: string;
  branch_name?: string;
  assigned_counselor_name?: string;
  created_by_name?: string;
  updated_by_name?: string | null;
  call_count?: number;
  next_followup?: ApiLeadNextFollowup | null;
}

/** Writable payload for POST/PATCH /api/leads/. */
export interface ApiLeadPayload {
  full_name?: string;
  phone?: string;
  secondary_phone?: string | null;
  email?: string | null;
  address?: string | null;
  /** Live backend expects the numeric lead-type id; string enum kept for compat. */
  lead_type?: number | ApiLeadType | null;
  expected_revenue?: string | null;
  notes?: string | null;
  source?: number | null;
  campaign?: number | null;
  branch?: number | null;
  priority?: number | null;
  status?: number | null;
  assigned_counselor?: number | null;
  primary_course?: number | null;
  province?: number | null;
  city?: number | null;
  landmark?: string | null;
  heard_from?: string | null;
  tags?: number[];
  custom_data?: Record<string, unknown>;
}

/* ----------------------------------------------------------- nested records */

export interface ApiLeadCall {
  id: number;
  lead: number;
  call_timestamp: string;
  direction: "inbound" | "outbound";
  /** User FK id of who made the call (backend requires it). */
  caller: number | string | null;
  caller_name?: string;
  phone_number: string | null;
  duration_seconds: number | null;
  outcome: string | null;
  notes: string | null;
  recording_url: string | null;
  next_followup_at: string | null;
  next_action: string | null;
  created_by?: number | null;
  created_by_name?: string;
  created_at: string;
}

export type ApiActivityType =
  | "call"
  | "whatsapp"
  | "note"
  | "meeting"
  | "status_change"
  | "assignment_change"
  | "demo_class"
  | "payment"
  | "enrollment";

export interface ApiLeadActivity {
  id: number;
  lead: number;
  activity_type: ApiActivityType;
  title: string;
  description: string | null;
  activity_at: string;
  created_by?: number | null;
  created_by_name?: string;
  created_at?: string;
}

export type ApiFollowupStatus = "pending" | "completed" | "missed" | "cancelled";

export interface ApiFollowup {
  id: number;
  lead: number;
  assigned_to: number | null;
  assigned_to_name?: string;
  scheduled_at: string;
  purpose: string | null;
  reminder_at: string | null;
  status: ApiFollowupStatus;
  completed_at?: string | null;
  notes?: string | null;
  branch?: number | null;
  created_at?: string;
}

export interface ApiLeadDocument {
  id: number;
  lead: number;
  document_type: string;
  file: string;
  created_at?: string;
}

export type ApiInterestLevel = "high" | "medium" | "low";

export interface ApiCourseInterest {
  id: number;
  lead: number;
  course: number;
  course_name?: string;
  is_primary: boolean;
  interest_level: ApiInterestLevel;
  created_at?: string;
}

export type ApiEnrollmentStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled"
  | "dropped_out"
  | "transferred";

export interface ApiEnrollment {
  id: number;
  lead?: number;
  course: number;
  course_name?: string;
  student: number | null;
  student_name?: string | null;
  batch: number | null;
  batch_name?: string | null;
  enrollment_date: string | null;
  status: ApiEnrollmentStatus;
  listed_fee: string;
  standard_discount: string;
  additional_discount: string;
  agreed_amount: string;
  remarks: string | null;
  total_paid: string;
  remaining_amount: string;
  is_full_paid: boolean;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApiEnrollmentPayload {
  course?: number;
  student?: number | null;
  batch?: number | null;
  enrollment_date?: string | null;
  status?: ApiEnrollmentStatus;
  listed_fee?: string;
  standard_discount?: string;
  additional_discount?: string;
  agreed_amount?: string;
  remarks?: string | null;
}

export type ApiPaymentStatus = "pending" | "successful" | "failed" | "refunded" | "voided";
export type ApiPaymentMethod = "cash" | "esewa" | "khalti" | "bank_transfer" | "card" | "connectips";

export interface ApiPayment {
  id: number;
  enrollment?: number;
  amount: string;
  payment_date: string;
  payment_method: ApiPaymentMethod;
  transaction_reference: string | null;
  status: ApiPaymentStatus;
  notes: string | null;
  received_by_name?: string;
  created_at?: string;
}

export interface ApiPaymentPayload {
  amount?: string;
  payment_date?: string;
  payment_method?: ApiPaymentMethod;
  transaction_reference?: string | null;
  status?: ApiPaymentStatus;
  notes?: string | null;
}

/* --------------------------------------------------------------- locations */

export interface ApiProvince {
  id: number;
  name: string;
  code?: string;
  is_active: boolean;
}

export interface ApiCity {
  id: number;
  name: string;
  province: number | null;
  province_name?: string;
  is_active: boolean;
}

/* -------------------------------------------- global (cross-lead) list rows */
/* Flat read-only rows from /api/followups/, /api/enrollments/, /api/payments/. */

export interface ApiFollowupListRow {
  id: number;
  lead: number;
  lead_name: string;
  lead_phone?: string;
  assigned_to: number | null;
  assigned_to_name?: string;
  scheduled_at: string;
  purpose: string | null;
  status: ApiFollowupStatus;
  branch?: number | null;
  branch_name?: string;
}

export interface ApiEnrollmentListRow {
  id: number;
  lead: number;
  lead_name: string;
  student: number | null;
  student_name?: string | null;
  course: number;
  course_name?: string;
  batch: string | null;
  status: ApiEnrollmentStatus;
  enrollment_date: string | null;
  listed_fee: string;
  agreed_amount: string;
  total_paid: string;
  remaining_amount: string;
  is_full_paid: boolean;
  branch?: number | null;
  branch_name?: string;
  created_at?: string;
}

export interface ApiPaymentListRow {
  id: number;
  enrollment: number;
  lead: number;
  lead_name: string;
  course_name?: string;
  amount: string;
  payment_date: string;
  payment_method: ApiPaymentMethod;
  transaction_reference: string | null;
  status: ApiPaymentStatus;
  received_by?: number | null;
  received_by_name?: string;
  branch?: number | null;
  branch_name?: string;
}

/* ---------------------------------------------------------------- branches */

export interface ApiBranch {
  id: number;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiBranchPayload {
  name?: string;
  code?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  is_active?: boolean;
}

/* ---------------------------------------------------------------- students */

export type ApiStudentStatus = "active" | "inactive" | "graduated" | "dropped" | "transferred";
export type ApiGender = "male" | "female" | "other";

export interface ApiStudent {
  id: number;
  student_id: string;
  full_name: string;
  phone: string;
  secondary_phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  gender: ApiGender | null;
  address: string | null;
  city: string | null;
  state: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_relation: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  enrolled_at: string | null;
  status: ApiStudentStatus;
  photo_url: string | null;
  notes: string | null;
  source: number | null;
  lead: number | null;
  branch: number | null;
  assigned_counselor: number | null;
  created_by?: number | null;
  updated_by?: number | null;
  created_at: string;
  updated_at: string;
  // denormalized
  source_name?: string;
  branch_name?: string;
  assigned_counselor_name?: string;
  created_by_name?: string;
  document_count?: number;
}

export interface ApiStudentPayload {
  full_name?: string;
  phone?: string;
  secondary_phone?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  gender?: ApiGender | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  guardian_relation?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  source?: number | null;
  lead?: number | null;
  branch?: number | null;
  assigned_counselor?: number | null;
  enrolled_at?: string | null;
  status?: ApiStudentStatus;
  photo_url?: string | null;
  notes?: string | null;
}

/* ------------------------------------------------------------------ upload */

export interface ApiUpload {
  key: string;
  url: string;
  filename: string;
  size: number;
}
