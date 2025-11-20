import cookieStorage, { type CookieOptions } from "@/core/store/cookieStorage";
import localStorage from "@/core/store/localStorage";
import { QueryClient } from "@tanstack/react-query";
import type { LoggedUser } from "../types/user.type";
import type { SellerInfo } from "../types/seller.type";
import type { DoctorInfo } from "../types/doctor.type";
import { getSellerInfo, type LoginSuccess } from "./http/auth.service";
import { STATUS_MAP } from "@/core/config/status";
import type { AxiosError } from "axios";

/* -------------------------------------------------------------------------- */
/*                               Storage section                               */
/* -------------------------------------------------------------------------- */

export const QK = {
  ME: ["me"] as const,
  SELLER_INFO: ["seller-info"] as const,
  DOCTOR_INFO: ["doctor-info"] as const,
};

export type AuthSnapshot = {
  accessToken?: string | null;
  refreshToken?: string | null;
};

export type AuthQueryData = Required<AuthSnapshot> & {
  user: LoggedUser;
  sellerInfo?: SellerInfo;
  doctorInfo?: DoctorInfo;
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

/**
 * Checks if a user has seller or seller-member role
 * @param roleValue - User's role value
 * @returns boolean - True if user is seller or seller-member
 */
function isSellerRole(roleValue: string): boolean {
  return ["seller-member", "seller"].includes(roleValue);
}
function isDistributorRole(roleValue: string): boolean {
  return ["distributor"].includes(roleValue);
}

/**
 * Checks if a user has doctor role
 * @param roleValue - User's role value
 * @returns boolean - True if user is doctor
 */
function isDoctorRole(roleValue: string): boolean {
  return ["doctor"].includes(roleValue);
}

/**
 * Fetches seller info only when cache is empty for seller/seller-member roles
 * @param qc - Query client instance
 * @param userId - User ID to fetch seller info for
 * @param me - Current auth data object
 * @returns Promise<SellerInfo | undefined> - Seller info or undefined if not needed
 */
async function fetchSellerInfoIfNeeded(
  qc: QueryClient,
  userId: string,
  me: AuthQueryData,
): Promise<SellerInfo | undefined> {
  // Check if seller info already exists in cache
  const existingSellerInfo = qc.getQueryData<SellerInfo>([
    ...QK.SELLER_INFO,
    userId,
  ]);

  if (existingSellerInfo) {
    return existingSellerInfo;
  }

  try {
    console.log(`Fetching seller info for user: ${userId}`);
    const response = await getSellerInfo(userId);

    console.log(
      "response.data.companyStatus",
      response.data.companyStatus,
      [
        STATUS_MAP.company.pending.value,
        STATUS_MAP.company.rejected.value,
      ].includes(response.data.companyStatus),
    );

    if (
      [
        STATUS_MAP.company.pending.value,
        STATUS_MAP.company.rejected.value,
      ].includes(response.data.companyStatus)
    ) {
      throw Error(
        me.user.firstName + " " + me.user.lastName + "is not approved yet",
      );
    }
    // Update both the seller info cache and the ME query
    qc.setQueryData([...QK.SELLER_INFO, userId], response.data);
    qc.setQueryData(QK.ME, {
      ...me,
      sellerInfo: response.data,
    });

    console.log(
      `Successfully fetched and cached seller info for user: ${userId}`,
    );
    return response.data;
  } catch (error) {
    const errorInstance = error as AxiosError;
    console.error(`Failed to fetch seller info for user ${userId}:`, error);

    // if (error instanceof Error && error.message === "Seller pending") {
    //   throw error;
    // }
    // Clear auth and throw error to redirect to login
    logout(qc);
    throw new Error(
      errorInstance?.message || "Authentication failed - please login again",
    );
  }
}

/**
 * Fetches doctor info only when cache is empty for doctor role
 * @param qc - Query client instance
 * @param userId - User ID to fetch doctor info for
 * @param me - Current auth data object
 * @returns Promise<DoctorInfo | undefined> - Doctor info or undefined if not needed
 */
async function fetchDoctorInfoIfNeeded(
  qc: QueryClient,
  userId: string,
  me: AuthQueryData,
): Promise<DoctorInfo | undefined> {
  // Check if doctor info already exists in cache
  const existingDoctorInfo = qc.getQueryData<DoctorInfo>([
    ...QK.DOCTOR_INFO,
    userId,
  ]);

  if (existingDoctorInfo) {
    return existingDoctorInfo;
  }

  try {
    console.log(`Fetching doctor info for user: ${userId}`);
    // const response = await getDoctorInfo(userId);

    // Update both the doctor info cache and the ME query
    // qc.setQueryData([...QK.DOCTOR_INFO, userId], response.data);
    qc.setQueryData(QK.ME, {
      ...me,
      // doctorInfo: response.data,
    });

    console.log(
      `Successfully fetched and cached doctor info for user: ${userId}`,
    );
    // Return undefined for now since API call is commented out
    // TODO: Uncomment and return response.data when API is ready
    return undefined;
  } catch (error) {
    const errorInstance = error as AxiosError;
    console.error(`Failed to fetch doctor info for user ${userId}:`, error);

    // Clear auth and throw error to redirect to login
    logout(qc);
    throw new Error(
      errorInstance?.message || "Authentication failed - please login again",
    );
  }
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

    // Automatically fetch seller info for seller and seller-member roles (only if cache is empty)
    if (isSellerRole(u.roleValue)) {
      await fetchSellerInfoIfNeeded(qc, u._id, me);
    } else if (isDoctorRole(u.roleValue)) {
      // Automatically fetch doctor info for doctor role (only if cache is empty)
      await fetchDoctorInfoIfNeeded(qc, u._id, me);
    
    } else if (isDistributorRole(u.roleValue)) {
      // Automatically fetch doctor info for doctor role (only if cache is empty)
      await fetchDoctorInfoIfNeeded(qc, u._id, me);
    } else {
      qc.setQueryData(QK.ME, me);
    }
  }
}

export function logout(qc?: QueryClient) {
  clearAuthCookies();
  clearUserLS();
  qc?.removeQueries({ queryKey: QK.ME, exact: true });
  qc?.removeQueries({ queryKey: QK.SELLER_INFO, exact: true });
  qc?.removeQueries({ queryKey: QK.DOCTOR_INFO, exact: true });
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

    // Fetch seller info if user role is seller-member or seller (only if cache is empty)
    if (isSellerRole(user.roleValue)) {
      await fetchSellerInfoIfNeeded(qc, user._id, me);
    } else if (isDoctorRole(user.roleValue)) {
      // Fetch doctor info if user role is doctor (only if cache is empty)
      await fetchDoctorInfoIfNeeded(qc, user._id, me);
    }

    return me;
  }
  throw new Error("Unauthenticated");
}
