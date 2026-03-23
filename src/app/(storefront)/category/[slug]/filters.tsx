"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { NativeSelect, TextInput, Group, Paper, Checkbox, Text } from "@mantine/core";

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <Paper p="md" radius="lg" withBorder mb="lg" shadow="xs">
      <Group gap="lg" wrap="wrap">
        <Group gap="xs">
          <Text size="sm" fw={500}>Sort by:</Text>
          <NativeSelect
            value={searchParams.get("sort") || ""}
            onChange={(e) => updateParams("sort", e.currentTarget.value)}
            w={160}
            data={[
              { value: "", label: "Newest" },
              { value: "price-asc", label: "Price: Low to High" },
              { value: "price-desc", label: "Price: High to Low" },
              { value: "name", label: "Name: A-Z" },
            ]}
          />
        </Group>
        <Group gap="xs">
          <Text size="sm" fw={500}>Price:</Text>
          <TextInput type="number" placeholder="Min" w={80} value={searchParams.get("minPrice") || ""} onChange={(e) => updateParams("minPrice", e.currentTarget.value)} />
          <Text c="dimmed">-</Text>
          <TextInput type="number" placeholder="Max" w={80} value={searchParams.get("maxPrice") || ""} onChange={(e) => updateParams("maxPrice", e.currentTarget.value)} />
        </Group>
        <Checkbox
          label="In Stock Only"
          checked={searchParams.get("inStock") === "true"}
          onChange={(e) => updateParams("inStock", e.currentTarget.checked ? "true" : "")}
          color="green"
        />
      </Group>
    </Paper>
  );
}
