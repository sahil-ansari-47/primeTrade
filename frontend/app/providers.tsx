"use client";

import * as React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "../theme/theme";
import { AuthProvider } from "../contexts/AuthContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

