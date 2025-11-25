import { type ReactNode } from "react";
import { Outlet } from "react-router";
import FormulatorHeader from "./FormulatorHeader";

const FormulatorLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="bg-background flex min-h-dvh flex-1 flex-row">
      <main className="h-dvh w-full flex-1 overflow-auto">
        <FormulatorHeader />
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default FormulatorLayout;

