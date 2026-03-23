import Link from "next/link";
import { Container, SimpleGrid, Stack, Text, Group, Divider, ThemeIcon, Box } from "@mantine/core";
import { ShoppingCart } from "lucide-react";

export function Footer() {
  return (
    <Box bg="dark.8" c="gray.5" py="xl">
      <Container size={1280} py="lg">
        <SimpleGrid cols={{ base: 1, md: 4 }} spacing="xl">
          <Stack gap="sm">
            <Link href="/" style={{ textDecoration: "none" }}>
              <Group gap="xs">
                <ThemeIcon color="green" size="md" radius="md">
                  <ShoppingCart size={16} />
                </ThemeIcon>
                <Text fw={700} size="lg" c="white">
                  Fresh<Text span c="green.4" inherit>Mart</Text>
                </Text>
              </Group>
            </Link>
            <Text size="sm" c="gray.5" mt="xs">
              Fresh groceries delivered to your door. Quality products at great prices, serving the Australian community.
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
            <Text size="sm">support@freshmart.com.au</Text>
            <Text size="sm">(03) 9123 4567</Text>
            <Text size="sm">Mon-Sat: 8am - 8pm</Text>
          </Stack>
        </SimpleGrid>

        <Divider my="xl" color="dark.6" />
        <Text size="sm" c="gray.6" ta="center">
          &copy; {new Date().getFullYear()} FreshMart. All rights reserved. ABN 12 345 678 901
        </Text>
      </Container>
    </Box>
  );
}
