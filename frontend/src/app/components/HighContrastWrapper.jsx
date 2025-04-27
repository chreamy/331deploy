"use client";
import { useHighContrast } from "./HighContrastContext";
import { useEffect } from "react";

export default function HighContrastWrapper({ children }) {
    const { highContrast } = useHighContrast();

    // Dynamically update CSS variables when highContrast changes
    useEffect(() => {
        if (highContrast) {
            document.documentElement.style.setProperty("--background", "#000");
        document.documentElement.style.setProperty("--foreground", "#FFF");
        document.documentElement.style.setProperty("--border-color", "#FFD700");
        document.documentElement.style.setProperty("--card-bg", "#222");
        } else {
            document.documentElement.style.setProperty("--background", "#3D2B1F");
        document.documentElement.style.setProperty("--foreground", "#EED9C4");
        document.documentElement.style.setProperty("--border-color", "#C2A385");
        document.documentElement.style.setProperty("--card-bg", "#FFFFFF");
        }
    }, [highContrast]);

    return (
        <div key={highContrast ? "high" : "normal"} style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
            {children}
        </div>
    );
}
