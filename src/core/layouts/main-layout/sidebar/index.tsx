import { Button } from "@/core/components/ui/button";
import { HorizontalLogo } from "@/core/config/svg";
import { useSidebar, useSidebarMobile } from "@/core/store/theme-provider";
import { cn } from "@/core/utils";
import { NavLink } from "react-router";
import SidebarNavigation from "./SidebarNavigation";

export default function Sidebar() {
  const { isSidebarOpen, isMobile } = useSidebar();
  const { showOverlay, handleOverlayClick } = useSidebarMobile();
  const width = "w-[var(--sidebar-width)]";

  return (
    <>
      {showOverlay && (
        <button
          tabIndex={-1}
          className="fixed inset-0 z-10 flex h-full w-full items-center justify-center bg-[#00000060] backdrop-blur-[1px]"
          onClick={handleOverlayClick}
          aria-label="Close sidebar overlay"
        />
      )}
      <aside
        className={cn(
          "bg-background w1-60 fixed z-10 order-first h-dvh overflow-y-auto px-2 transition-all",
          width,
          !isSidebarOpen && "-translate-x-100",
          isMobile
            ? isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "",
        )}
        aria-label="Sidebar"
      >
        <div className="bg-background sticky top-0 z-10 flex items-center justify-between border-b py-2">
          <NavLink
            to="/"
            className="data-[label=text]:text-primary flex h-10 items-center no-underline transition-all active:scale-98"
            aria-label="Go to home"
          >
            <HorizontalLogo className="h-7" />
          </NavLink>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground md:hidden"
            onClick={handleOverlayClick}
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <div className="space-y-2 py-3">
          <SidebarNavigation />
        </div>
      </aside>
      <div
        className={cn(
          "hidden transition-all md:block",
          width,
          !isSidebarOpen && "w-0",
        )}
        aria-hidden
      />
    </>
  );
}
