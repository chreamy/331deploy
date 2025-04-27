"use client";
import { createContext, useContext, useState, useEffect } from "react";

// Create context
const HighContrastContext = createContext();

// Provider component
export function HighContrastProvider({ children }) {
    const [highContrast, setHighContrast] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("highContrastMode");
        setHighContrast(saved === "true");
    }, []);

    const toggleHighContrast = () => {
        const newMode = !highContrast;
        setHighContrast(newMode);
        localStorage.setItem("highContrastMode", newMode.toString());
    };

    return (
        <HighContrastContext.Provider value={{ highContrast, toggleHighContrast }}>
            {children}
        </HighContrastContext.Provider>
    );
}

export function useHighContrast() {
    return useContext(HighContrastContext);
}
