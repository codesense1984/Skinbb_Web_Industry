import { Outlet } from "react-router";
import authBg from "@/core/assets/images/auth_bg.png";

const AuthLayout = () => {
  return (
    <div className="h-dvh">
      <div className="grid h-full w-full md:grid-cols-6">
        <div
          className="min-h-50 md:col-span-3 lg:col-span-4"
          style={{
            background: `url(${authBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
        <div className="md:col-span-3 lg:col-span-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
