// import Sidebar from "@/core/layouts/main-layout/Sidebar";
import { type ReactNode } from "react";
import { Outlet } from "react-router";
import Header from "./Header";
import Sidebar from "./sidebar";

const MainLayout = ({ children }: { children?: ReactNode }) => {
  return (
    <div className="bg-background flex min-h-dvh flex-1 flex-row">
      {<Sidebar />}
      <main className="h-dvh w-full flex-1 overflow-auto">
        <Header />
        {children ?? <Outlet />}
      </main>
    </div>
  );
};

export default MainLayout;
