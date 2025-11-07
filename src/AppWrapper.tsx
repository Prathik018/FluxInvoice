import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();

  useEffect(() => {
    let isReload = false;

    // Detect refresh using "beforeunload" + temp flag
    window.addEventListener("beforeunload", () => {
      isReload = true;
    });

    // Detect tab close / browser close only
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        setTimeout(() => {
          // If reload happened, do NOT logout
          if (isReload) return;

          // If navigating using link, do NOT logout
          const nav = performance.getEntriesByType("navigation");
          const navEntry = nav[0] as PerformanceNavigationTiming | undefined;

          if (navEntry?.type === "navigate") return;

          // Real tab close or browser close
          signOut({ redirectUrl: "/" });
        }, 150);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [signOut]);

  return <>{children}</>;
}
