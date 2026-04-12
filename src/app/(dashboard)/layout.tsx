"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AppShell, NavLink, Group, Text, Badge, Burger, Divider } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Truck, MapPin, LogOut, Store } from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/delivery-zones", label: "Delivery Zones", icon: Truck },
  { href: "/dashboard/suburbs", label: "Suburbs", icon: MapPin },
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
            <Image src="/logo-icon.svg" alt="Lumbini" width={36} height={36} style={{ borderRadius: "var(--mantine-radius-md)" }} />
            <Text fw={700} size="lg" c="#800000">Lumbini</Text>
            <Badge color="maroon" variant="light" size="xs" ml="auto">ADMIN</Badge>
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
              color="maroon"
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
