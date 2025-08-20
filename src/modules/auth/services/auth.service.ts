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

/* -------------------------------------------------------------------------- */
/*                             Service / public API                            */
/* -------------------------------------------------------------------------- */

export function onLoginSuccess(
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
  }
}

export function logout(qc?: QueryClient) {
  clearAuthCookies();
  clearUserLS();
  qc?.removeQueries({ queryKey: QK.ME, exact: true });
}

export function hasAuth() {
  const { accessToken, refreshToken, userId } = getAuthCookies();
  return Boolean(accessToken && refreshToken && userId);
}

export function bootstrapAuthCache(qc: QueryClient) {
  const cookies = getAuthCookies();
  const user = getUserFromLS();
  if (cookies.accessToken && cookies.refreshToken && cookies.userId && user) {
    const me: AuthQueryData = {
      user,
      accessToken: cookies.accessToken,
      refreshToken: cookies.refreshToken,
    };
    qc.setQueryData(QK.ME, me);
    return me;
  }
  throw new Error("Unauthenticated");
}
