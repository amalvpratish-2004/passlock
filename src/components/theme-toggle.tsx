// components/theme-toggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="w-auto px-3 h-9 cursor-pointer"
    >
      <div className="flex items-center justify-center space-x-2">
        <div className="relative w-4 h-4">
          <Sun className="absolute top-0 left-0 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-0 left-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
        <span className="text-sm font-medium">Theme</span>
      </div>
    </Button>
  );
}