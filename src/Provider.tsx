import React from "react";
import { Toaster } from "./core/components/ui/sonner";
import { Provider as ReduxProvider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./core/store";
import { ThemeProvider } from "./core/store/theme-provider";

store.subscribe(() => console.log(store.getState(), "store"));

const Provider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <Toaster richColors position="top-right" />
          {children}
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
};

export default Provider;
