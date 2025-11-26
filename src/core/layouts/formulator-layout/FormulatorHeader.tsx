import logo from "@/core/assets/images/logo-icon.png";
import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
} from "@/core/components/ui/avatar";
import { Button } from "@/core/components/ui/button";
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";
import { cn } from "@/core/utils";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { ROLE } from "@/modules/auth/types/permission.type.";
import { PANEL_ROUTES } from "@/modules/panel/routes/constant";
import { DOCTOR_ROUTES } from "@/modules/doctor/routes/constant";
import { FORMULATOR_ROUTES } from "@/modules/formulator/routes/constant";
import { useEffect, useMemo } from "react";
import { NavLink } from "react-router";

const FormulatorHeader = () => {
  const { role, user, signOut } = useAuth();
  const fullName = user?.firstName || "";
  const profile = user?.profilePic?.[0]?.url || "";
  const fullNameInitial = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;

  // Check if user is a doctor
  const isDoctor = useMemo(() => {
    return role === ROLE.DOCTOR;
  }, [role]);

  // Check if user is a formulator
  const isFormulator = useMemo(() => {
    return role === ROLE.FORMULATOR;
  }, [role]);

  // Get account route based on role
  const accountRoute = useMemo(() => {
    if (isDoctor) {
      return DOCTOR_ROUTES.ACCOUNT.BASE;
    }
    if (isFormulator) {
      return FORMULATOR_ROUTES.ACCOUNT.BASE;
    }
    return PANEL_ROUTES.ACCOUNT;
  }, [isDoctor, isFormulator]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <header className="header-main sticky1 bg-background top-0">
      <div
        className={cn(
          "w-full flex h-14 items-center justify-between p-2 md:p-4 [&_svg]:size-6",
        )}
      >
        <div className="flex">
          <NavLink
            to="/"
            className="flex items-center no-underline transition-all active:scale-98"
          >
            <img src={logo} alt="logo" className="h-10" />
          </NavLink>
        </div>
        <div className="flex items-center gap-1">
          <DropdownMenu
            items={[
              {
                children: (
                  <NavLink
                    to={accountRoute}
                    className="flex w-full items-center gap-2"
                  >
                    Account
                  </NavLink>
                ),
                type: "item" as const,
                className: "cursor-pointer",
              },
              { type: "separator" as const },
              {
                children: "Logout",
                type: "item" as const,
                className: "cursor-pointer",
                onClick: () => signOut(),
              },
            ]}
            asChild
          >
            <Button
              variant={"ghost"}
              className="flex h-full items-center gap-2 p-1 focus-visible:outline-transparent"
            >
              <AvatarRoot className="bg-primary/10 size-9 border font-medium tracking-wide uppercase">
                <AvatarImage src={profile} />
                <AvatarFallback>{fullNameInitial}</AvatarFallback>
              </AvatarRoot>
              <div className="hidden space-y-0 text-left leading-none md:block">
                <p className="text-foreground">{fullName}</p>
                <p className="text-sm capitalize">{role}</p>
              </div>
            </Button>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default FormulatorHeader;

