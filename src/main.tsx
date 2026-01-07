import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Provider from "./Provider";
import { FullLoader } from "./core/components/ui/loader";
import { wireAuthAdapters } from "./core/services/http";
import "./core/styles/index.css";
import { queryClient } from "./core/utils/queryClient";
import { AUTH_ROUTES } from "./modules/auth/routes/constants";
import {
  getAuthCookies,
  logout,
  setAuthCookies,
} from "./modules/auth/services/auth.service";
import { appRoutes } from "./router";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider>
      <Suspense fallback={<FullLoader />}>
        <RouterProvider router={appRoutes} />
      </Suspense>
    </Provider>
  </StrictMode>,
);

wireAuthAdapters({
  getAuth: () => ({
    accessToken: getAuthCookies()?.accessToken,
    refreshToken: getAuthCookies()?.refreshToken,
  }),
  setTokens: async (t) => await setAuthCookies(t),
  logout: async () => {
    await logout(queryClient);
    window.location.replace(AUTH_ROUTES.SIGN_IN);
  },
});
