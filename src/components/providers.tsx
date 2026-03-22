"use client";

import { SessionProvider } from "next-auth/react";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const theme = createTheme({
  primaryColor: "green",
  fontFamily: "system-ui, -apple-system, sans-serif",
  defaultRadius: "md",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="bottom-right" />
        {children}
      </MantineProvider>
    </SessionProvider>
  );
}
