export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HR_MANAGER"
  | "FINANCE_MANAGER"
  | "RECRUITER"
  | "EMPLOYEE";

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: string | null;
};

export type LoginResponse = {
  token: string;
  user: User;
};
