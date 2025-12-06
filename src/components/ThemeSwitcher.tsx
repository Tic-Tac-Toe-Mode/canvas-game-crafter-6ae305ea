import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Moon, Sun, Palette, X, Check } from "lucide-react";

export type ColorTheme = "cyan" | "purple" | "emerald" | "rose" | "amber";

interface ThemeSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

const themes: { id: ColorTheme; name: string; primary: string; accent: string }[] = [
  { id: "cyan", name: "Ocean", primary: "bg-cyan-500", accent: "bg-purple-500" },
  { id: "purple", name: "Violet", primary: "bg-purple-500", accent: "bg-pink-500" },
  { id: "emerald", name: "Forest", primary: "bg-emerald-500", accent: "bg-teal-500" },
  { id: "rose", name: "Cherry", primary: "bg-rose-500", accent: "bg-orange-500" },
  { id: "amber", name: "Sunset", primary: "bg-amber-500", accent: "bg-red-500" },
];

export const ThemeSwitcher = ({ isOpen, onClose }: ThemeSwitcherProps) => {
  const [isDark, setIsDark] = useState(false);
  const [colorTheme, setColorTheme] = useState<ColorTheme>("cyan");

  useEffect(() => {
    const savedDark = localStorage.getItem("tictactoe-dark") === "true";
    const savedTheme = localStorage.getItem("tictactoe-theme") as ColorTheme || "cyan";
    setIsDark(savedDark);
    setColorTheme(savedTheme);
    applyTheme(savedDark, savedTheme);
  }, []);

  const applyTheme = (dark: boolean, theme: ColorTheme) => {
    const root = document.documentElement;
    
    if (dark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply color theme
    const themeColors: Record<ColorTheme, { primary: string; accent: string; ring: string }> = {
      cyan: { primary: "190 95% 45%", accent: "280 70% 60%", ring: "190 95% 45%" },
      purple: { primary: "270 70% 55%", accent: "330 80% 60%", ring: "270 70% 55%" },
      emerald: { primary: "160 80% 40%", accent: "175 70% 45%", ring: "160 80% 40%" },
      rose: { primary: "350 80% 55%", accent: "25 90% 55%", ring: "350 80% 55%" },
      amber: { primary: "38 95% 50%", accent: "15 90% 55%", ring: "38 95% 50%" },
    };

    const colors = themeColors[theme];
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--ring", colors.ring);
    root.style.setProperty("--accent", colors.accent);

    // Update gradient variables
    const primaryHsl = `hsl(${colors.primary})`;
    const accentHsl = `hsl(${colors.accent})`;
    root.style.setProperty("--gradient-primary", `linear-gradient(135deg, ${primaryHsl}, ${accentHsl})`);
    root.style.setProperty("--shadow-glow", `0 8px 32px -8px hsl(${colors.primary} / 0.4)`);
  };

  const toggleDarkMode = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem("tictactoe-dark", String(newDark));
    applyTheme(newDark, colorTheme);
  };

  const selectColorTheme = (theme: ColorTheme) => {
    setColorTheme(theme);
    localStorage.setItem("tictactoe-theme", theme);
    applyTheme(isDark, theme);
  };

  if (!isOpen) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 space-y-6 shadow-2xl animate-fade-in">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            Themes
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Dark Mode Toggle */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Display Mode</h3>
          <div className="flex gap-3">
            <Button
              variant={!isDark ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => { if (isDark) toggleDarkMode(); }}
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              variant={isDark ? "default" : "outline"}
              className="flex-1 gap-2"
              onClick={() => { if (!isDark) toggleDarkMode(); }}
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>

        {/* Color Themes */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Color Theme</h3>
          <div className="grid grid-cols-1 gap-2">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => selectColorTheme(theme.id)}
                className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all
                  ${colorTheme === theme.id 
                    ? "border-primary bg-primary/10" 
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    <div className={`w-6 h-6 rounded-full ${theme.primary} border-2 border-background`} />
                    <div className={`w-6 h-6 rounded-full ${theme.accent} border-2 border-background`} />
                  </div>
                  <span className="font-medium">{theme.name}</span>
                </div>
                {colorTheme === theme.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </Card>
    </div>
  );
};

export const useThemeInit = () => {
  useEffect(() => {
    const savedDark = localStorage.getItem("tictactoe-dark") === "true";
    const savedTheme = localStorage.getItem("tictactoe-theme") as ColorTheme || "cyan";
    
    const root = document.documentElement;
    
    if (savedDark) {
      root.classList.add("dark");
    }

    const themeColors: Record<ColorTheme, { primary: string; accent: string; ring: string }> = {
      cyan: { primary: "190 95% 45%", accent: "280 70% 60%", ring: "190 95% 45%" },
      purple: { primary: "270 70% 55%", accent: "330 80% 60%", ring: "270 70% 55%" },
      emerald: { primary: "160 80% 40%", accent: "175 70% 45%", ring: "160 80% 40%" },
      rose: { primary: "350 80% 55%", accent: "25 90% 55%", ring: "350 80% 55%" },
      amber: { primary: "38 95% 50%", accent: "15 90% 55%", ring: "38 95% 50%" },
    };

    const colors = themeColors[savedTheme];
    if (colors) {
      root.style.setProperty("--primary", colors.primary);
      root.style.setProperty("--ring", colors.ring);
      root.style.setProperty("--accent", colors.accent);
      
      const primaryHsl = `hsl(${colors.primary})`;
      const accentHsl = `hsl(${colors.accent})`;
      root.style.setProperty("--gradient-primary", `linear-gradient(135deg, ${primaryHsl}, ${accentHsl})`);
      root.style.setProperty("--shadow-glow", `0 8px 32px -8px hsl(${colors.primary} / 0.4)`);
    }
  }, []);
};
