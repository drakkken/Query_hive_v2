"use client";
import React from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";
const ThemeProvider = ({ children, ...props }) => {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
};

export default ThemeProvider;
