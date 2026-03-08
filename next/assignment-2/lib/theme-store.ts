"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type Theme = "light" | "dark" | "system";
type ThemeState = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            theme: "system",
            setTheme: (theme) =>{
                set({theme})
                if(typeof document !== "undefined"){
                    const root = document.documentElement;
                    root.classList.remove("light", "dark");
                    if(theme === "system") {
                        const systemTheme = window.matchMedia("(prefers-color-schema: dark)").matches
                        ? "dark"
                        : "light"
                        root.classList.add(systemTheme);
                    } else {
                        root.classList.add(theme)
                    }
                }
            },
            toggleTheme: () => {
                const current = get().theme;
                const next: Theme = current === "dark" ? "light" : "dark";
                get().setTheme(next);
            }
        }),
        {
            name: "theme",
            storage: createJSONStorage(() => localStorage),
            partialize: (state => ({theme: state.theme}))
        }
    )
);