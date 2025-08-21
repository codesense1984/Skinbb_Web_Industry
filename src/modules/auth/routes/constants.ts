import { ROUTE } from "@/core/routes/constant";

const AUTH_BASE = "/auth";

export const AUTH_ROUTES = {
  BASE: AUTH_BASE,
  SIGN_IN: ROUTE.build(AUTH_BASE, "sign-in"),
  SIGN_UP: ROUTE.build(AUTH_BASE, "sign-up"),
  SIGN_IN_MAIN: ROUTE.build(AUTH_BASE, "sign-in-main"),
  FORGOT_PASSWORD: ROUTE.build(AUTH_BASE, "forgot-password"),
  // RESET_PASSWORD: ROUTE.build(AUTH_BASE, "reset-password"),       // form with email/token
  // RESET_PASSWORD_WITH_TOKEN: (token: string = ROUTE.seg.id) =>
  // ROUTE.build(AUTH_BASE, "reset-password", token),               // /auth/reset-password/:token
  // VERIFY_EMAIL: ROUTE.build(AUTH_BASE, "verify-email"),
  // VERIFY_EMAIL_WITH_TOKEN: (token: string = ROUTE.seg.id) =>
  //   ROUTE.build(AUTH_BASE, "verify-email", token),                 // /auth/verify-email/:token
} as const;
