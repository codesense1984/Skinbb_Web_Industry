import cookieStorage, { type CookieOptions } from "@/core/store/cookieStorage";
import localStorage from "@/core/store/localStorage";
import { QueryClient } from "@tanstack/react-query";
import type { LoggedUser } from "../types/user.type";
import type { LoginSuccess } from "./http/auth.service";

/* -------------------------------------------------------------------------- */
/*                               Storage section                               */
/* -------------------------------------------------------------------------- */

export const QK = {
  ME: ["me"] as const,
  SELLER_INFO: ["seller-info"] as const,
};

export type AuthSnapshot = {
  accessToken?: string | null;
  refreshToken?: string | null;
};

export type AuthQueryData = Required<AuthSnapshot> & {
  user: LoggedUser;
};

export const COOKIE_KEY = {
  ACCESS: "sb_at",
  REFRESH: "sb_rt",
  USER_ID: "sb_uid",
  REMEMBER: "sb_remember",
} as const;

export const LS_KEY = {
  USER: "sb_user",
} as const;

export function setAuthCookies(
  args: AuthSnapshot & {
    userId?: string;
    remember?: boolean;
  },
) {
  const { accessToken, refreshToken, userId, remember } = args;

  const opts: CookieOptions = remember
    ? { expires: 7, secure: true, sameSite: "Lax" }
    : { secure: true, sameSite: "Lax" };

  if (accessToken) {
    cookieStorage.setItem(COOKIE_KEY.ACCESS, accessToken, opts);
  }
  if (refreshToken) {
    cookieStorage.setItem(COOKIE_KEY.REFRESH, refreshToken, opts);
  }
  if (userId) {
    cookieStorage.setItem(COOKIE_KEY.USER_ID, userId, opts);
  }
  if (remember) {
    cookieStorage.setItem(COOKIE_KEY.REMEMBER, String(remember), opts);
  }
}

export function getAuthCookies() {
  return {
    accessToken: cookieStorage.getItem(COOKIE_KEY.ACCESS),
    refreshToken: cookieStorage.getItem(COOKIE_KEY.REFRESH),
    userId: cookieStorage.getItem(COOKIE_KEY.USER_ID),
    remember: cookieStorage.getItem(COOKIE_KEY.REMEMBER),
  };
}

export function clearAuthCookies() {
  cookieStorage.removeItem(COOKIE_KEY.ACCESS);
  cookieStorage.removeItem(COOKIE_KEY.REFRESH);
  cookieStorage.removeItem(COOKIE_KEY.USER_ID);
  cookieStorage.removeItem(COOKIE_KEY.REMEMBER);
}

export function saveUserToLS(user: LoggedUser) {
  localStorage.setItem(LS_KEY.USER, user);
}

export function getUserFromLS(): LoggedUser | undefined {
  const raw = localStorage.getItem(LS_KEY.USER);
  try {
    return raw ? (JSON.parse(raw) as LoggedUser) : undefined;
  } catch {
    return undefined;
  }
}

export function clearUserLS() {
  localStorage.removeItem(LS_KEY.USER);
}

export async function fetchAndCacheSellerInfo(qc: QueryClient) {
  try {
    const { getSellerInfo } = await import("./http/auth.service");
    const response = await getSellerInfo();
    qc.setQueryData(QK.SELLER_INFO, response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch seller info:", error);
    throw error;
  }
}

export async function ensureSellerInfo(qc: QueryClient) {
  // Check if seller info is already cached
  const cachedSellerInfo = qc.getQueryData(QK.SELLER_INFO);

  if (!cachedSellerInfo) {
    // If not cached, fetch it
    return await fetchAndCacheSellerInfo(qc);
  }

  return cachedSellerInfo;
}

/* -------------------------------------------------------------------------- */
/*                             Service / public API                            */
/* -------------------------------------------------------------------------- */

export async function onLoginSuccess(
  qc: QueryClient,
  data: LoginSuccess,
  remember?: boolean,
) {
  const u = Array.isArray(data.data.user) ? data.data.user[0] : data.data.user;

  setAuthCookies({
    accessToken: data.data.accessToken,
    refreshToken: data.data.refreshToken,
    userId: u?._id ?? "",
    remember,
  });

  if (u) {
    saveUserToLS(u);
    const me: AuthQueryData = {
      user: u,
      accessToken: data.data.accessToken,
      refreshToken: data.data.refreshToken,
    };
    qc.setQueryData(QK.ME, me);

    // Fetch seller info if user role is seller-member
    if (u.roleValue === "seller-member") {
      try {
        await fetchAndCacheSellerInfo(qc);
      } catch (error) {
        console.error("Failed to fetch seller info on login:", error);
        // Clear auth and throw error to prevent login success
        logout(qc);
        throw new Error(
          "Failed to fetch seller information - please try again",
        );
      }
    }
  }
}

export function logout(qc?: QueryClient) {
  clearAuthCookies();
  clearUserLS();
  qc?.removeQueries({ queryKey: QK.ME, exact: true });
  qc?.removeQueries({ queryKey: QK.SELLER_INFO, exact: true });
}

export function hasAuth() {
  const { accessToken, refreshToken, userId } = getAuthCookies();
  return Boolean(accessToken && refreshToken && userId);
}

export async function bootstrapAuthCache(qc: QueryClient) {
  const cookies = getAuthCookies();
  const user = getUserFromLS();
  if (cookies.accessToken && cookies.refreshToken && cookies.userId && user) {
    const me: AuthQueryData = {
      user,
      accessToken: cookies.accessToken,
      refreshToken: cookies.refreshToken,
    };
    qc.setQueryData(QK.ME, me);

    // Fetch seller info if user role is seller-member (for page reload)
    if (user.roleValue === "seller-member") {
      try {
        await fetchAndCacheSellerInfo(qc);
      } catch (error) {
        console.error("Failed to fetch seller info on bootstrap:", error);
        // Clear auth and throw error to redirect to login
        logout(qc);
        throw new Error("Authentication failed - please login again");
      }
    }

    return me;
  }
  throw new Error("Unauthenticated");
}
