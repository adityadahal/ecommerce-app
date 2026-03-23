import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Container, Grid, NavLink, Title } from "@mantine/core";
import { User, ShoppingBag, MapPin } from "lucide-react";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <Container size={1280} py="xl">
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 3 }}>
            <Title order={4} mb="md">My Account</Title>
            <Link href="/account" style={{ textDecoration: "none" }}>
              <NavLink label="Profile" leftSection={<User size={16} />} style={{ borderRadius: "var(--mantine-radius-md)" }} />
            </Link>
            <Link href="/account/orders" style={{ textDecoration: "none" }}>
              <NavLink label="Orders" leftSection={<ShoppingBag size={16} />} style={{ borderRadius: "var(--mantine-radius-md)" }} />
            </Link>
            <Link href="/account/addresses" style={{ textDecoration: "none" }}>
              <NavLink label="Addresses" leftSection={<MapPin size={16} />} style={{ borderRadius: "var(--mantine-radius-md)" }} />
            </Link>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 9 }}>{children}</Grid.Col>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
