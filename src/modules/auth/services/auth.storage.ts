// // src/modules/auth/lib/auth.storage.ts

// import cookieStorage from "@/core/store/cookieStorage";
// import localStorage from "@/core/store/localStorage";
// import type { LoggedUser } from "../types/user.type";

// export const QK = {
//   ME: ["me"] as const,
// };

// export type AuthSnapshot = {
//   accessToken: string | undefined;
//   refreshToken: string | undefined;
// };

// export type AuthQueryData = AuthSnapshot & {
//   user: LoggedUser;
// };

// export const COOKIE_KEY = {
//   ACCESS: "sb_at",
//   REFRESH: "sb_rt",
//   USER_ID: "sb_uid",
// } as const;

// export const LS_KEY = {
//   USER: "sb_user",
// } as const;

// export function setAuthCookies(
//   args: AuthSnapshot & {
//     userId?: string;
//     remember?: boolean;
//   },
// ) {
//   const { accessToken, refreshToken, userId } = args;

//   //   const opts = remember
//   //     ? { expires: 7, secure: true, sameSite: "lax" as const }
//   //     : { secure: true, sameSite: "lax" as const }; // session cookie if no remember
//   if (accessToken) {
//     cookieStorage.setItem(COOKIE_KEY.ACCESS, accessToken);
//   }
//   if (refreshToken) {
//     cookieStorage.setItem(COOKIE_KEY.REFRESH, refreshToken);
//   }
//   if (userId) {
//     cookieStorage.setItem(COOKIE_KEY.USER_ID, userId);
//   }
// }

// export function getAuthCookies() {
//   return {
//     accessToken: cookieStorage.getItem(COOKIE_KEY.ACCESS),
//     refreshToken: cookieStorage.getItem(COOKIE_KEY.REFRESH),
//     userId: cookieStorage.getItem(COOKIE_KEY.USER_ID),
//   };
// }

// export function clearAuthCookies() {
//   cookieStorage.removeItem(COOKIE_KEY.ACCESS);
//   cookieStorage.removeItem(COOKIE_KEY.REFRESH);
//   cookieStorage.removeItem(COOKIE_KEY.USER_ID);
// }

// export function saveUserToLS(user: LoggedUser) {
//   localStorage.setItem(LS_KEY.USER, user);
// }
// export function getUserFromLS(): LoggedUser | undefined {
//   const raw = localStorage.getItem(LS_KEY.USER);
//   try {
//     return raw ? (JSON.parse(raw) as LoggedUser) : undefined;
//   } catch {
//     return undefined;
//   }
// }
// export function clearUserLS() {
//   localStorage.removeItem(LS_KEY.USER);
// }
