import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React from "react";
import { Provider as ReduxProvider } from "react-redux";
import { Toaster } from "./core/components/ui/sonner";
import { store } from "./core/store";
import { ThemeProvider } from "./core/store/theme-provider";
import { queryClient } from "./core/utils/queryClient";

store.subscribe(() => console.log(store.getState(), "store"));

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      {/* <PersistGate loading={null} persistor={persistor}> */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Toaster richColors position="top-right" />
          {children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
      {/* </PersistGate> */}
    </ReduxProvider>
  );
};

export default Provider;
