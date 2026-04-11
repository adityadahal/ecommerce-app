"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Package, LayoutDashboard, LogOut } from "lucide-react";
import { Group, Text, Button, ActionIcon, Indicator, Menu, Burger, Collapse, ThemeIcon, Anchor, Box, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useLocalCart } from "@/hooks/use-cart";
import { LiveSearch } from "@/components/store/live-search";

const navLinks = [
  { href: "/category/fruits-vegetables", label: "Fruits & Vegetables" },
  { href: "/category/dairy-eggs", label: "Dairy & Eggs" },
  { href: "/category/meat-seafood", label: "Meat & Seafood" },
  { href: "/category/bakery", label: "Bakery" },
  { href: "/category/pantry", label: "Pantry" },
];

export function Header() {
  const { data: session } = useSession();
  const { itemCount } = useLocalCart();
  const [mobileOpen, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);

  return (
    <>
      {/* Announcement Bar */}
      <Box
        py={6}
        ta="center"
        c="white"
        style={{ background: "linear-gradient(to right, #800000, #6a0000)" }}
      >
        <Text size="xs" fw={500} inherit>
          Free delivery on orders over $75 &bull; Same-day delivery for orders before 2pm
        </Text>
      </Box>

      {/* Main Header */}
      <Box
        pos="sticky"
        top={0}
        style={{ zIndex: 40, backdropFilter: "blur(16px)", backgroundColor: "rgba(255,255,255,0.85)", borderBottom: "1px solid var(--mantine-color-gray-2)" }}
      >
        <Group h={60} px="md" maw={1280} mx="auto" justify="space-between" wrap="nowrap">
          <Group gap="md" wrap="nowrap">
            <Burger opened={mobileOpen} onClick={toggleMobile} hiddenFrom="lg" size="sm" />
            <Anchor component={Link} href="/" underline="never">
              <Group gap={8} wrap="nowrap">
                <Image src="/logo-icon.svg" alt="Lumbini" width={36} height={36} style={{ borderRadius: "var(--mantine-radius-md)" }} />
                <Box>
                  <Text fw={700} size="sm" c="#800000" lh={1.1}>LUMBINI</Text>
                  <Text size="xs" c="#DFA031" fw={600} lh={1}>MEAT & GROCERY</Text>
                </Box>
              </Group>
            </Anchor>
          </Group>

          {/* Desktop nav */}
          <Group gap={4} visibleFrom="lg">
            {navLinks.map((link) => (
              <Anchor key={link.href} component={Link} href={link.href} underline="never" c="dark" size="sm" fw={500} px="sm" py="xs" style={{ borderRadius: "var(--mantine-radius-md)" }} className="hover:bg-[var(--mantine-color-maroon-0)]">
                {link.label}
              </Anchor>
            ))}
          </Group>

          {/* Search */}
          <Box visibleFrom="md" flex={1} maw={400} ml="auto">
            <LiveSearch />
          </Box>

          {/* Right actions */}
          <Group gap="xs" wrap="nowrap">
            <Box visibleFrom="sm">
              <Button component={Link} href="/track" variant="subtle" color="gray" size="sm" leftSection={<Package size={16} />}>
                Track Order
              </Button>
            </Box>

            <Indicator color="maroon" label={itemCount} size={18} disabled={itemCount === 0} offset={4}>
              <ActionIcon component={Link} href="/cart" variant="subtle" color="gray" size="lg">
                <ShoppingCart size={20} />
              </ActionIcon>
            </Indicator>

            {/* Admin menu */}
            {session?.user?.role === "ADMIN" && (
              <Menu shadow="md" width={220} position="bottom-end">
                <Menu.Target>
                  <ActionIcon variant="subtle" color="gray" size="lg">
                    <ThemeIcon color="maroon" size="sm" radius="xl" variant="light">
                      <User size={14} />
                    </ThemeIcon>
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>
                    <Text fw={600} size="sm">{session.user.name}</Text>
                    <Text size="xs" c="dimmed">{session.user.email}</Text>
                  </Menu.Label>
                  <Menu.Divider />
                  <Menu.Item component={Link} href="/dashboard" leftSection={<LayoutDashboard size={16} />}>
                    Dashboard
                  </Menu.Item>
                  <Menu.Item color="red" leftSection={<LogOut size={16} />} onClick={() => signOut()}>
                    Sign Out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>

        {/* Mobile menu */}
        <Collapse in={mobileOpen}>
          <Box p="md" hiddenFrom="lg" style={{ borderTop: "1px solid var(--mantine-color-gray-1)" }}>
            <LiveSearch />
            <Box mt="sm">
              {navLinks.map((link) => (
                <Anchor
                  key={link.href}
                  component={Link}
                  href={link.href}
                  underline="never"
                  c="dark"
                  size="sm"
                  fw={500}
                  display="block"
                  px="sm"
                  py="xs"
                  style={{ borderRadius: "var(--mantine-radius-md)" }}
                  onClick={closeMobile}
                >
                  {link.label}
                </Anchor>
              ))}
              <Divider my="xs" />
              <Anchor component={Link} href="/track" underline="never" c="dark" size="sm" fw={500} display="block" px="sm" py="xs" onClick={closeMobile}>
                <Group gap="xs">
                  <Package size={14} />
                  Track Order
                </Group>
              </Anchor>
            </Box>
          </Box>
        </Collapse>
      </Box>
    </>
  );
}
