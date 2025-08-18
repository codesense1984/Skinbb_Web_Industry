import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import Provider from "./Provider";
// import { FullLoader } from "./core/components/ui/loader";
import { appRoutes } from "./router";
import "./core/styles/index.css";
import { FullLoader } from "./core/components/ui/loader";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <Provider>
      <Suspense fallback={<FullLoader />}>
        <RouterProvider router={appRoutes} />
      </Suspense>
    </Provider>
  </StrictMode>,
);
