import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";

export default function AppWrapper({ children }: { children: React.ReactNode }) {
  const { signOut } = useClerk();

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const navType = performance.getEntriesByType("navigation")[0]?.type;

      // If this is a refresh or back/forward navigation, DO NOT logout
      if (navType === "reload" || navType === "back_forward") {
        return;
      }

      // If user is closing the tab or browser — LOG OUT
      signOut({ redirectUrl: "/" });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [signOut]);

  return <>{children}</>;
}
