import type { ApiResponse } from "@/lib/api-response";

export class ApiClientError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiClientError";
  }
}

export async function fetchApiData<T>(
  url: string,
  options?: { allowNull?: boolean },
): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new ApiClientError(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.success) {
    throw new ApiClientError(payload.error ?? "Request failed");
  }

  if (payload.data === null && !options?.allowNull) {
    throw new ApiClientError(payload.error ?? "Request failed");
  }

  return payload.data as T;
}

export function loadErrorMessage(
  isError: boolean,
  resource = "this data",
): string | null {
  return isError
    ? `Couldn't load ${resource}. Refresh the page and try again.`
    : null;
}

export async function postApiData<T, B = unknown>(
  url: string,
  body: B,
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === null) {
    throw new ApiClientError(payload.error ?? "Request failed");
  }

  return payload.data;
}

export async function patchApiData<T, B = unknown>(
  url: string,
  body: B,
): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === null) {
    throw new ApiClientError(payload.error ?? "Request failed");
  }

  return payload.data;
}

export async function deleteApiData<T>(url: string): Promise<T> {
  const response = await fetch(url, { method: "DELETE" });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === null) {
    throw new ApiClientError(payload.error ?? "Request failed");
  }

  return payload.data;
}
