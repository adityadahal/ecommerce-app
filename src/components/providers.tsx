"use client";

import { SessionProvider } from "next-auth/react";
import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

const maroon: MantineColorsTuple = [
  "#fff0f0",
  "#ffdcdc",
  "#f5b0b0",
  "#e88282",
  "#d65656",
  "#c03030",
  "#800000",
  "#6a0000",
  "#540000",
  "#3e0000",
];

const gold: MantineColorsTuple = [
  "#fff9eb",
  "#fff1cc",
  "#ffe099",
  "#ffcf66",
  "#f5bc33",
  "#e8aa20",
  "#DFA031",
  "#c08520",
  "#9a6a15",
  "#7a5210",
];

const theme = createTheme({
  primaryColor: "maroon",
  colors: {
    maroon,
    gold,
  },
  fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
  defaultRadius: "md",
  headings: {
    fontWeight: "700",
    fontFamily: "var(--font-sans, system-ui, -apple-system, sans-serif)",
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
      },
    },
    TextInput: {
      defaultProps: {
        radius: "md",
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: "md",
      },
    },
    NativeSelect: {
      defaultProps: {
        radius: "md",
      },
    },
    Badge: {
      defaultProps: {
        radius: "xl",
      },
    },
  },
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
