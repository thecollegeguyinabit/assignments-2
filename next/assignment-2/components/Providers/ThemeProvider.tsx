"use client";

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { useThemeStore } from "@/lib/theme-store";


function ThemeSync({children}: { children: React.ReactNode}) {
    const {setTheme: setNextTheme} = useTheme();
    const { theme } = useThemeStore();

    React.useEffect(() => {
        setNextTheme(theme)
    }, [theme, setNextTheme]);

    return <>{children}</>
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider 
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            <ThemeSync>{children}</ThemeSync>
        </NextThemesProvider>
}