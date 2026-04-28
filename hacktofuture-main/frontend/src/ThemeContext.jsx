import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark

  const theme = {
    isDark,
    bg: isDark ? "#000000" : "#ffffff",
    bgSecondary: isDark ? "#0a0a0a" : "#f9f9f9",
    text: isDark ? "#ffffff" : "#000000",
    textSecondary: isDark ? "#888888" : "#666666",
    border: isDark ? "#1a1a1a" : "#e5e5e5",
    accent: "#0070f3",
  };

  const toggleTheme = () => setIsDark(!isDark);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
