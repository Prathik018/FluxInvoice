import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();

  useEffect(() => {
    const handleBeforeUnload = (_event: BeforeUnloadEvent) => {
      // Get navigation entries safely and cast to correct type
      const navEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;

      const navType = navEntry?.type;

      // reload or back/forward should NOT log out
      if (navType === "reload" || navType === "back_forward") {
        return;
      }

      // USER IS CLOSING TAB or BROWSER
      signOut({ redirectUrl: "/" });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [signOut]);

  return <>{children}</>;
}
