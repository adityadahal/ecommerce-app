"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppShell, NavLink, Group, Text, Badge, Burger, Divider, ThemeIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Truck, LogOut, ShoppingCart, Store } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/delivery-zones", label: "Delivery Zones", icon: Truck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 260, breakpoint: "md", collapsed: { mobile: !opened } }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
          <Text fw={600} size="lg">Admin Dashboard</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs">
        <AppShell.Section>
          <Group px="sm" py="md">
            <ThemeIcon color="green" size="md" radius="md">
              <ShoppingCart size={16} />
            </ThemeIcon>
            <Text fw={700} size="lg">FreshMart</Text>
            <Badge color="green" variant="light" size="xs" ml="auto">ADMIN</Badge>
          </Group>
        </AppShell.Section>

        <AppShell.Section grow>
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={pathname === item.href}
              color="green"
              variant="light"
              style={{ borderRadius: "var(--mantine-radius-md)" }}
            />
          ))}
        </AppShell.Section>

        <AppShell.Section>
          <Divider my="sm" />
          <NavLink
            component={Link}
            href="/"
            label="View Store"
            leftSection={<Store size={18} />}
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          />
          <NavLink
            label="Sign Out"
            leftSection={<LogOut size={18} />}
            color="red"
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
