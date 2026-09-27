import { ResearchRequest, ResearchResponse } from "@/types";

export const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Check connectivity to the FastAPI backend service.
 */
export async function checkBackendHealth(baseUrl: string = DEFAULT_API_BASE_URL): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/`, {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Send research parameters to the backend and retrieve synthesized report.
 */
export async function generateResearch(
  request: ResearchRequest,
  baseUrl: string = DEFAULT_API_BASE_URL
): Promise<ResearchResponse> {
  const url = `${baseUrl.replace(/\/$/, "")}/research`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    let errorMsg = `Server error (${res.status})`;
    try {
      const errorData = await res.json();
      if (errorData.detail) {
        errorMsg = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
      }
    } catch {
      // fallback to status text
    }
    throw new Error(errorMsg);
  }

  return (await res.json()) as ResearchResponse;
}
