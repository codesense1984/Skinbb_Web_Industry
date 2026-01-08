import { useEffect } from "react";

const useBlockBack = (shouldBlock: boolean) => {
  useEffect(() => {
    if (!shouldBlock) return;

    const onBack = () => {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave?"
      );

      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", onBack);

    return () => window.removeEventListener("popstate", onBack);
  }, [shouldBlock]);
};

export default useBlockBack;