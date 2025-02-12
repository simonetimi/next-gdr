"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Switch } from "@heroui/react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher({ className }: { className: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className={className}>
      <Switch
        isSelected={currentTheme === "dark" ? false : true}
        size="md"
        color="default"
        thumbIcon={({ isSelected }) =>
          isSelected ? (
            <Sun className="p-0.5" />
          ) : (
            <Moon className="p-0.5 text-gray-500" />
          )
        }
        onChange={
          currentTheme === "light"
            ? () => setTheme("dark")
            : () => setTheme("light")
        }
      ></Switch>
    </div>
  );
}
