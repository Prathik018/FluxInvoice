import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun } from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();

  return (
   <header className="
  w-full flex justify-center pt-6 px-4 sticky top-0 z-50">
  <div
    className="
      max-w-5xl w-full
      flex items-center justify-between
      px-6 py-3
      rounded-2xl
      border
      shadow-xl
      bg-white/20 dark:bg-neutral-900/10
      backdrop-blur-xl
      transition-all
    "
  >

        {/* Logo */}
        <a
          href="/"
          className="text-xl font-bold tracking-tight text-black dark:text-white"
        >
          fluxInvoice
        </a>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <a href="/dashboard">
            <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
              Dashboard
            </Button>
          </a>

          {/* Theme Toggle */}
          <Button
            size="icon"
            variant="outline"
            className="backdrop-blur-md bg-white/40 dark:bg-black/40 border-white/20 dark:border-black/20"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-300" />
            ) : (
              <Moon className="h-5 w-5 text-gray-800" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
