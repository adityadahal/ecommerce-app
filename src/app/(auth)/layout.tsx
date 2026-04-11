import Image from "next/image";
import { Group, Text, Stack, Box } from "@mantine/core";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left panel — brand */}
      <Box
        visibleFrom="lg"
        w="50%"
        pos="relative"
        style={{ overflow: "hidden", background: "linear-gradient(135deg, #800000 0%, #6a0000 50%, #540000 100%)" }}
      >
        <Box pos="absolute" top={0} right={0} w={320} h={320} style={{ borderRadius: "50%", background: "rgba(255,255,255,0.05)", transform: "translate(33%,-33%)" }} />
        <Box pos="absolute" bottom={0} left={0} w={256} h={256} style={{ borderRadius: "50%", background: "rgba(255,255,255,0.05)", transform: "translate(-33%,33%)" }} />

        <Stack align="center" justify="center" h="100%" pos="relative" p="xl">
          <Image src="/logo-icon.svg" alt="Lumbini Meat & Grocery" width={100} height={100} />
          <Text fw={700} fz={28} c="white" mt="md">Lumbini Meat & Grocery</Text>
          <Text size="lg" c="#DFA031">Admin Portal</Text>
          <Text size="sm" c="white" ta="center" maw={380} mt="xl" style={{ opacity: 0.6 }}>
            Manage your products, orders, categories, and deliveries all in one place.
          </Text>
          <Group gap="xs" mt="xl" style={{ opacity: 0.5 }}>
            <Text size="xs" c="white">Powered by Lumbini Meat & Grocery</Text>
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
