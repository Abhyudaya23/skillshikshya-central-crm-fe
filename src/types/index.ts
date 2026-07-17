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
  role: number | null;
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
}

export type UpdateUserPayload = Partial<
  Omit<User, "id" | "is_staff" | "is_superuser" | "last_login">
>;

export interface Group {
  id: number;
  name: string;
  permissions: number[];
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
