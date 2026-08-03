export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  /** Group (role) IDs — M2M. Present in login/register responses, not the list serializer. */
  groups?: number[];
  /** Effective permission codenames, e.g. "account.add_user". Login/register only. */
  user_permissions?: string[];
  daily_call_target_min: number | null;
  monthly_enrollment_target: string | null;
  designation: string | null;
  phone: string | null;
  shift_start: string | null;
  shift_end: string | null;
  custom_weekly_offs: boolean;
  work_sun: boolean;
  work_mon: boolean;
  work_tue: boolean;
  work_wed: boolean;
  work_thu: boolean;
  work_fri: boolean;
  work_sat: boolean;
  exclude_from_calls: boolean;
  exclude_from_enrollment: boolean;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  /** Assigned branch FK id (nullable). Pending backend support — see docs/user-branch-counselor-handoff.md. */
  branch: number | null;
  /** Denormalized branch label (read-only). */
  branch_name?: string | null;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  designation?: string;
  daily_call_target_min?: number;
  monthly_enrollment_target?: string;
  shift_start?: string;
  shift_end?: string;
  custom_weekly_offs?: boolean;
  work_sun?: boolean;
  work_mon?: boolean;
  work_tue?: boolean;
  work_wed?: boolean;
  work_thu?: boolean;
  work_fri?: boolean;
  work_sat?: boolean;
  exclude_from_calls?: boolean;
  exclude_from_enrollment?: boolean;
  branch?: number | null;
}

export type UpdateUserPayload = Partial<
  Omit<User, "id" | "is_staff" | "is_superuser" | "last_login">
>;

export interface Group {
  id: number;
  name: string;
  permissions: number[];
}

export interface ApiNotification {
  id: number;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Permission {
  id: number;
  name: string;
  codename: string;
  content_type: number;
  content_type_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
  confirm_new_password: string;
}

export interface UserListParams {
  page?: number;
  page_size?: number;
  search?: string;
  name?: string;
  email?: string;
  designation?: string;
  phone?: string;
  is_active?: boolean;
  is_staff?: boolean;
  group?: number;
  /**
   * Filter users by their assigned branch. Pending backend support
   * (see docs/user-branch-counselor-handoff.md) — ignored server-side until
   * `/api/users/?branch_id=` ships, at which point this narrows the list.
   */
  branch_id?: number;
  ordering?: string;
}

export type CourseType = "course" | "master_class" | "job_ready_program";

export interface Course {
  id: number;
  course_type: CourseType;
  name: string;
  full_amount: string;
  one_time_payment_discount: string | null;
  syllabus: string | null;
  remarks: string | null;
}

export type CoursePayload = Partial<Omit<Course, "id">>;

export interface CourseListParams {
  page?: number;
  page_size?: number;
  search?: string;
  name?: string;
  course_type?: CourseType;
  ordering?: string;
}
