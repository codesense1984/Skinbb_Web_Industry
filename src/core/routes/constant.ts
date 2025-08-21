// Central route helpers + shared segments
export const ROUTE = {
  /** `/a/b/c` builder that trims duplicate slashes */
  build: (...parts: (string | number | null | undefined)[]) =>
    (
      "/" +
      parts
        .filter(Boolean)
        .map((p) => String(p).replace(/^\/+|\/+$/g, ""))
        .filter(Boolean)
        .join("/")
    ).replace(/\/{2,}/g, "/"),

  seg: {
    create: "create",
    edit: "edit",
    detail: "detail",
    onboard: "onboard",
    id: ":id",
  } as const,
} as const;

// ---- App-wide simple aliases (kept for compatibility) ----
export const ROUTES = {
  ROOT: "/",
  DASHBOARD: "/",
  CREATE: "/create",
  EDIT: "/edit",
  DETAIL: "/:id",
} as const;

// export const ROUTES = {
//   CREATE: "/create",
//   EDIT: "/edit",
//   DASHBOARD: "/",
// };
