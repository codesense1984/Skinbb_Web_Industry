import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultSidebarOpen?: boolean;
  storageKey?: string;
  sidebarStorageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Web sidebar (persistent)
  isWebSidebarOpen: boolean;
  toggleWebSidebar: () => void;
  setWebSidebarOpen: (open: boolean) => void;
  // Mobile sidebar (temporary)
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;
  // Mobile detection
  isMobile: boolean;
  // Combined state for easy access
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openSidebar: () => void;
  closeSidebar: () => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
  isWebSidebarOpen: true,
  toggleWebSidebar: () => null,
  setWebSidebarOpen: () => null,
  isMobileSidebarOpen: false,
  toggleMobileSidebar: () => null,
  setMobileSidebarOpen: () => null,
  isMobile: false,
  isSidebarOpen: true,
  toggleSidebar: () => null,
  setSidebarOpen: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  defaultSidebarOpen = true,
  storageKey = "vite-ui-theme",
  sidebarStorageKey = "vite-ui-sidebar",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const [isMobile, setIsMobile] = useState(false);

  // Web sidebar state (persistent in localStorage)
  const [isWebSidebarOpen, setIsWebSidebarOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(sidebarStorageKey);
      return stored !== null ? stored === "true" : defaultSidebarOpen;
    }
    return defaultSidebarOpen;
  });

  // Mobile sidebar state (temporary, always starts closed)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState<boolean>(false);

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Close mobile sidebar when switching to desktop
      if (!mobile && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobileSidebarOpen]);

  // Save web sidebar state to localStorage
  useEffect(() => {
    localStorage.setItem(sidebarStorageKey, isWebSidebarOpen.toString());
  }, [isWebSidebarOpen, sidebarStorageKey]);

  // Save sidebar state to localStorage
  // useEffect(() => {
  //   localStorage.setItem(sidebarStorageKey, isSidebarOpen.toString());
  // }, [isSidebarOpen, sidebarStorageKey]);

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);
  };

  // Web sidebar controls
  const toggleWebSidebar = () => setIsWebSidebarOpen((prev) => !prev);
  const setWebSidebarOpen = (open: boolean) => setIsWebSidebarOpen(open);

  // Mobile sidebar controls
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const setMobileSidebarOpen = (open: boolean) => setIsMobileSidebarOpen(open);

  // Combined helpers for easy access
  const isSidebarOpen = isMobile ? isMobileSidebarOpen : isWebSidebarOpen;
  const toggleSidebar = isMobile ? toggleMobileSidebar : toggleWebSidebar;
  const setSidebarOpen = (open: boolean) =>
    isMobile ? setMobileSidebarOpen(open) : setWebSidebarOpen(open);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const value = {
    theme,
    setTheme: handleSetTheme,
    isWebSidebarOpen,
    toggleWebSidebar,
    setWebSidebarOpen,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    setMobileSidebarOpen,
    isMobile,
    isSidebarOpen,
    toggleSidebar,
    setSidebarOpen,
    openSidebar,
    closeSidebar,
  };
  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

// Convenience hook for sidebar functionality
export const useSidebar = () => {
  const context = useTheme();

  return {
    isSidebarOpen: context.isSidebarOpen,
    isMobile: context.isMobile,
    toggleSidebar: context.toggleSidebar,
    openSidebar: context.openSidebar,
    closeSidebar: context.closeSidebar,
    setSidebarOpen: context.setSidebarOpen,
  };
};

export const useSidebarMobile = () => {
  const { isSidebarOpen, isMobile, closeSidebar } = useSidebar();

  const handleOverlayClick = () => {
    if (isMobile && isSidebarOpen) {
      closeSidebar();
    }
  };

  return {
    showOverlay: isMobile && isSidebarOpen,
    handleOverlayClick,
  };
};
