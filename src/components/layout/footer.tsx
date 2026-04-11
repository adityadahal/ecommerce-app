import Link from "next/link";
import Image from "next/image";
import { Container, SimpleGrid, Stack, Text, Group, Divider, Box } from "@mantine/core";

export function Footer() {
  return (
    <Box bg="dark.8" c="gray.5" py="xl">
      <Container size={1280} py="lg">
        <SimpleGrid cols={{ base: 1, md: 4 }} spacing="xl">
          <Stack gap="sm">
            <Link href="/" style={{ textDecoration: "none" }}>
              <Group gap="xs">
                <Image src="/logo-icon.svg" alt="Lumbini" width={36} height={36} style={{ borderRadius: "var(--mantine-radius-md)" }} />
                <Box>
                  <Text fw={700} size="sm" c="white" lh={1.1}>LUMBINI</Text>
                  <Text size="xs" c="#DFA031" fw={600} lh={1}>MEAT & GROCERY</Text>
                </Box>
              </Group>
            </Link>
            <Text size="sm" c="gray.5" mt="xs">
              Fresh meat and groceries delivered to your door. Quality products at great prices, serving the Australian community.
            </Text>
          </Stack>

          <Stack gap="xs">
            <Text fw={600} c="white" mb="xs">Shop</Text>
            <Link href="/category/fruits-vegetables"><Text c="gray.5" size="sm" className="hover:underline">Fruits & Vegetables</Text></Link>
            <Link href="/category/dairy-eggs"><Text c="gray.5" size="sm" className="hover:underline">Dairy & Eggs</Text></Link>
            <Link href="/category/meat-seafood"><Text c="gray.5" size="sm" className="hover:underline">Meat & Seafood</Text></Link>
            <Link href="/category/bakery"><Text c="gray.5" size="sm" className="hover:underline">Bakery</Text></Link>
            <Link href="/category/pantry"><Text c="gray.5" size="sm" className="hover:underline">Pantry</Text></Link>
          </Stack>

          <Stack gap="xs">
            <Text fw={600} c="white" mb="xs">Customer Service</Text>
            <Link href="/track"><Text c="gray.5" size="sm" className="hover:underline">Track Order</Text></Link>
            <Link href="/contact"><Text c="gray.5" size="sm" className="hover:underline">Contact Us</Text></Link>
            <Link href="/delivery"><Text c="gray.5" size="sm" className="hover:underline">Delivery Information</Text></Link>
            <Link href="/returns"><Text c="gray.5" size="sm" className="hover:underline">Returns & Refunds</Text></Link>
            <Link href="/faq"><Text c="gray.5" size="sm" className="hover:underline">FAQ</Text></Link>
          </Stack>

          <Stack gap="xs">
            <Text fw={600} c="white" mb="xs">Contact</Text>
            <Text size="sm">Melbourne, VIC 3000</Text>
            <Text size="sm">support@lumbinimeat.com.au</Text>
            <Text size="sm">(03) 9123 4567</Text>
            <Text size="sm">Mon-Sat: 8am - 8pm</Text>
          </Stack>
        </SimpleGrid>

        <Divider my="xl" color="dark.6" />
        <Text size="sm" c="gray.6" ta="center">
          &copy; {new Date().getFullYear()} Lumbini Meat &amp; Grocery. All rights reserved. ABN 12 345 678 901
        </Text>
      </Container>
    </Box>
  );
}
