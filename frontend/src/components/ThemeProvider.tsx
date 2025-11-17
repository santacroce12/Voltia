import { createContext, useContext, useEffect, useState } from "react";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: "dark" | "light";
  storageKey?: string;
};

type ThemeProviderState = {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
};

const initialState: ThemeProviderState = {
  theme: "light",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "voltia-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<"dark" | "light">(defaultTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = (localStorage.getItem(storageKey) as "dark" | "light") || defaultTheme;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(storedTheme);
    setThemeState(storedTheme);
  }, [defaultTheme, storageKey]);

  const applyTheme = (nextTheme: "dark" | "light") => {
    if (typeof window === "undefined") return;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(nextTheme);
    localStorage.setItem(storageKey, nextTheme);
    setThemeState(nextTheme);
  };

  const value = {
    theme,
    setTheme: applyTheme,
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
