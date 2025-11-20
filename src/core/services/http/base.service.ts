import { baseApiUrl } from "@/core/config/baseUrls";
import type { AuthSnapshot } from "@/modules/auth/services/auth.service";
import {
  QueryClient,
  type DefaultOptions,
  type QueryKey,
} from "@tanstack/react-query";
import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";

// ---- Config ---------------------------------------------------------------
export const API_BASE_URL = baseApiUrl;
export const REQUEST_TIMEOUT_MS = 25_000; // reasonable network timeout

// If you still have Redux auth slice, wire it here. Otherwise, swap with your auth store.
// This indirection keeps base service store‑agnostic.

export type GetAuthFn = () => AuthSnapshot;
export type SetTokensFn = (tokens: AuthSnapshot) => void | Promise<void>;
export type LogoutFn = () => void | Promise<void>;

let getAuth: GetAuthFn = () => ({
  accessToken: undefined,
  refreshToken: undefined,
});
let setTokens: SetTokensFn | null = null;
let logout: LogoutFn | null = null;

export function wireAuthAdapters(adapters: {
  getAuth?: GetAuthFn;
  setTokens?: SetTokensFn;
  logout?: LogoutFn;
}) {
  if (adapters.getAuth) getAuth = adapters.getAuth;
  if (adapters.setTokens) setTokens = adapters.setTokens;
  if (adapters.logout) logout = adapters.logout;
}

// ---- Axios instance -------------------------------------------------------
export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
  // Let React Query abort via `signal`
  // signal: (AbortSignal as unknown as undefined), // placeholder to allow passing per‑request
  // withCredentials: false, // if you use httpOnly refresh tokens/cookies
});

// Attach Authorization header on every request
http.interceptors.request.use((config) => {
  const { accessToken } = getAuth();
  if (accessToken) {
    // Ensure headers is an AxiosHeaders instance
    if (!config.headers || !(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }
    (config.headers as AxiosHeaders).set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }
  return config;
});
// ---- Refresh token single‑flight queue -----------------------------------
let isRefreshing = false;
let pendingQueue: Array<(token: string | null) => void> = [];

async function refreshAccessToken(): Promise<string | null> {
  const { refreshToken } = getAuth();
  console.log("🚀 ~ refreshAccessToken ~ refreshToken:", refreshToken);
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/api/v1/users/refresh-token`,
      { refreshToken },
      { timeout: REQUEST_TIMEOUT_MS },
    );
    const newAccessToken: string | undefined = data?.data?.accessToken;
    const newRefreshToken: string | undefined = data?.data?.refreshToken;
    await setTokens?.({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
    return newAccessToken ?? null;
  } catch {
    return null;
  }
}

http.interceptors.response.use(
  (res) => res,
  async (error: unknown) => {
    // console.log("🚀 ~response error:", error);
    // If request was aborted by React Query, surface a friendly error
    if (axios.isCancel(error)) {
      return Promise.reject(
        createApiError("Request was cancelled", 499, error),
      );
    }

    // ✅ Narrow unknown → AxiosError
    if (!axios.isAxiosError(error)) {
      // Non-Axios error (thrown by code, runtime, etc.)
      return Promise.reject(createApiError("Unexpected error", 0, error));
    }

    const original = (error.config ?? {}) as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status ?? 0;

    // Handle 401 once: try refresh, replay queued requests
    const { accessToken, refreshToken } = getAuth();
    if (status === 401 && !original?._retry && accessToken && refreshToken) {
      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        // flush queued
        pendingQueue.forEach((resolve) => resolve(newToken));
        pendingQueue = [];

        if (!newToken) {
          // logout?.();
          logout?.();
          return Promise.reject(
            createApiError(
              "Session expired. Please sign in again.",
              401,
              error,
            ),
          );
        }
      }

      // wait for ongoing refresh
      const tokenFromQueue = await new Promise<string | null>((resolve) =>
        pendingQueue.push(resolve),
      );
      if (tokenFromQueue) {
        // retry original with fresh token
        original.headers = {
          ...(original.headers ?? {}),
          Authorization: `Bearer ${tokenFromQueue}`,
        };
        return http(original);
      }
      logout?.();
      return Promise.reject(
        createApiError("Session expired. Please sign in again.", 401, error),
      );
    }

    // Non‑auth errors
    return Promise.reject(normalizeAxiosError(error));
  },
);

// ---- Thin request wrapper (typed, signal‑aware) ---------------------------
export type RequestConfig<TBody = unknown> = Omit<
  AxiosRequestConfig<TBody>,
  "url" | "method"
> & {
  signal?: AbortSignal; // from React Query
};

async function request<TResp = unknown, TBody = unknown>(
  method: AxiosRequestConfig["method"],
  url: string,
  data?: TBody,
  config?: RequestConfig<TBody>,
): Promise<TResp> {
  const res: AxiosResponse<TResp> = await http({
    method,
    url,
    data,
    ...(config ?? {}),
  });
  return res.data as TResp;
}

export const api = {
  get: <T = unknown>(url: string, config?: RequestConfig) =>
    request<T>("get", url, undefined, config),
  post: <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: RequestConfig<B>,
  ) => request<T, B>("post", url, body, config),
  put: <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: RequestConfig<B>,
  ) => request<T, B>("put", url, body, config),
  patch: <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config?: RequestConfig<B>,
  ) => request<T, B>("patch", url, body, config),
  delete: <T = unknown>(url: string, config?: RequestConfig) =>
    request<T>("delete", url, undefined, config),
};

// ---- React Query: sane defaults + helpers --------------------------------
export const defaultQueryOptions: DefaultOptions = {
  queries: {
    staleTime: 5_000, // 10 seconds: avoid over‑fetching
    // gcTime: 5 * 60_000, // 5 min cache
    refetchOnReconnect: true,
    // refetchOnWindowFocus: "always",
    refetchOnWindowFocus: false,
    retry(failureCount, err) {
      const e = err as AxiosError;
      const status = e.response?.status ?? 0;
      // don't hammer on client errors or auth failures
      if (status >= 400 && status < 500 && status !== 429) return false;
      return failureCount < 2; // small, respectful retry budget
    },
  },
  mutations: { retry: 0 },
};

export function createQueryClient(overrides?: Partial<DefaultOptions>) {
  return new QueryClient({
    defaultOptions: { ...defaultQueryOptions, ...(overrides ?? {}) },
  });
}

// Query key utility to keep keys consistent & typed
export const qk = {
  by: (...parts: (string | number | boolean | null | undefined)[]) =>
    parts.filter((p) => p !== undefined) as QueryKey,
};

// ---- Error helpers --------------------------------------------------------
export type ApiErrorShape = {
  message: string;
  status?: number;
  code?: string;
} & Record<string, unknown>;

export function createApiError(
  message: string,
  status?: number,
  cause?: unknown,
  extras?: Record<string, unknown>,
): ApiErrorShape {
  const err: ApiErrorShape = { message, status, ...(extras ?? {}) };
  if (cause && cause instanceof AxiosError) {
    err.code = cause.code;
  }
  return err;
}

export function normalizeAxiosError(err: unknown): ApiErrorShape {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const serverMessage =
      (err.response?.data as { message?: string; error?: string })?.message ??
      (err.response?.data as { message?: string; error?: string })?.error ??
      err.message ??
      "Request failed";
    return createApiError(String(serverMessage), status, err);
  }
  return createApiError(err instanceof Error ? err.message : "Unknown error");
}

// Optional: small pagination helper
export type PageParams = { page?: number; limit?: number };
export type PageResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export const buildPageQuery = (params?: PageParams) =>
  new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 10),
  }).toString();

// ---- Example usage patterns ----------------------------------------------
// import { useQuery, useMutation } from "@tanstack/react-query";
//
// export function useProducts(params?: PageParams) {
//   return useQuery({
//     queryKey: qk.by("products", params?.page, params?.limit),
//     queryFn: ({ signal }) => api.get<PageResponse<Product>>(`/api/v1/products?${buildPageQuery(params)}`, { signal }),
//   });
// }
//
// export function useCreateProduct() {
//   return useMutation({
//     mutationFn: (payload: ProductInput) => api.post<Product>("/api/v1/products", payload),
//   });
// }
