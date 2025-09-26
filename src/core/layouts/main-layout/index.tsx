// import Sidebar from "@/core/layouts/main-layout/Sidebar";
import { type ReactNode } from "react";
import { Outlet } from "react-router";
import Header from "./Header";
import Sidebar from "./sidebar";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ROLE } from "@/modules/auth/types/permission.type.";

const MainLayout = ({ children }: { children?: ReactNode }) => {
  const { role } = useAuth();
  return (
    <div className="bg-background flex min-h-dvh flex-1 flex-row">
      {/* <Sidebar /> */}
      {role === ROLE.ADMIN && <Sidebar />}
      <main className="h-dvh w-full flex-1 overflow-auto">
        <Header />
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
