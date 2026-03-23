import { Group, Text, ThemeIcon, Stack, Box } from "@mantine/core";
import { ShoppingCart, Leaf } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <Box
        visibleFrom="lg"
        w="50%"
        pos="relative"
        style={{ overflow: "hidden", background: "linear-gradient(135deg, #059669 0%, #047857 50%, #0f766e 100%)" }}
      >
        <Box pos="absolute" top={0} right={0} w={320} h={320} style={{ borderRadius: "50%", background: "rgba(255,255,255,0.05)", transform: "translate(33%,-33%)" }} />
        <Box pos="absolute" bottom={0} left={0} w={256} h={256} style={{ borderRadius: "50%", background: "rgba(255,255,255,0.05)", transform: "translate(-33%,33%)" }} />

        <Stack align="center" justify="center" h="100%" pos="relative" p="xl">
          <ThemeIcon size={80} radius="xl" variant="white" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <ShoppingCart size={40} color="white" />
          </ThemeIcon>
          <Text fw={700} fz={28} c="white" mt="md">FreshMart</Text>
          <Text size="lg" c="green.1">Admin Portal</Text>
          <Text size="sm" c="green.2" ta="center" maw={380} mt="xl" style={{ opacity: 0.6 }}>
            Manage your products, orders, categories, and deliveries all in one place.
          </Text>
          <Group gap="xs" mt="xl" style={{ opacity: 0.5 }}>
            <Leaf size={14} color="white" />
            <Text size="xs" c="white">Powered by FreshMart</Text>
          </Group>
        </Stack>
      </Box>

      {/* Right panel — form */}
      <Box flex={1} bg="gray.0" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--mantine-spacing-lg)" }}>
        {children}
      </Box>
    </div>
  );
}
