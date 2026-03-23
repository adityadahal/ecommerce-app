"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { NativeSelect, TextInput } from "@mantine/core";

export function CategoryFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Sort by:</label>
        <NativeSelect
          value={searchParams.get("sort") || ""}
          onChange={(e) => updateParams("sort", e.currentTarget.value)}
          className="w-40"
          data={[
            { value: "", label: "Newest" },
            { value: "price-asc", label: "Price: Low to High" },
            { value: "price-desc", label: "Price: High to Low" },
            { value: "name", label: "Name: A-Z" },
          ]}
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium whitespace-nowrap">Price:</label>
        <TextInput
          type="number"
          placeholder="Min"
          className="w-20"
          value={searchParams.get("minPrice") || ""}
          onChange={(e) => updateParams("minPrice", e.currentTarget.value)}
        />
        <span>-</span>
        <TextInput
          type="number"
          placeholder="Max"
          className="w-20"
          value={searchParams.get("maxPrice") || ""}
          onChange={(e) => updateParams("maxPrice", e.currentTarget.value)}
        />
      </div>
      <label htmlFor="inStock-filter" className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          id="inStock-filter"
          type="checkbox"
          checked={searchParams.get("inStock") === "true"}
          onChange={(e) => updateParams("inStock", e.target.checked ? "true" : "")}
          className="rounded border-gray-300"
        />
        In Stock Only
      </label>
    </div>
  );
}
