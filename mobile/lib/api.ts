import Constants from "expo-constants";

import type { ApiResponse, LoginResponse, User } from "@/lib/types";

function getApiBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const hostUri = Constants.expoConfig?.hostUri;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:3000`;
  }

  return "http://localhost:3000";
}

const API_BASE_URL = getApiBaseUrl();

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  return response.json() as Promise<ApiResponse<T>>;
}

export async function login(
  email: string,
  password: string,
  rememberMe: boolean,
): Promise<ApiResponse<LoginResponse>> {
  return request<LoginResponse>("/api/mobile/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export async function getCurrentUser(
  token: string,
): Promise<ApiResponse<User>> {
  return request<User>("/api/mobile/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export { API_BASE_URL };
