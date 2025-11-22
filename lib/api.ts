const BASE_URL = "https://ccscaps.com/api";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  code: number;
  data: T;
}

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

async function request<T>(
  endpoint: string,
  method: RequestMethod,
  body?: any
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Handle 401 Unauthorized globally
    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        alert(
          "로그인이 필요하거나 세션이 만료되었습니다. 다시 로그인해주세요."
        );
        window.location.href = "/login";
      }
      throw new Error("Unauthorized");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

export const api = {
  get: <T = any>(endpoint: string) => request<T>(endpoint, "GET"),
  post: <T = any>(endpoint: string, body: any) =>
    request<T>(endpoint, "POST", body),
  put: <T = any>(endpoint: string, body: any) =>
    request<T>(endpoint, "PUT", body),
  delete: <T = any>(endpoint: string) => request<T>(endpoint, "DELETE"),
  patch: <T = any>(endpoint: string, body: any) =>
    request<T>(endpoint, "PATCH", body),
};
