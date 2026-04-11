"use client";

import { Button, Group, Text, NativeSelect } from "@mantine/core";

const ROWS_PER_PAGE_OPTIONS = ["10", "20", "50", "100"];

type TablePaginationProps = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
};

export function TablePagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: TablePaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
      <Group gap="sm">
        <Text size="sm" c="dimmed">Rows per page:</Text>
        <NativeSelect
          value={String(limit)}
          onChange={(e) => onLimitChange(parseInt(e.currentTarget.value))}
          data={ROWS_PER_PAGE_OPTIONS}
          size="xs"
          w={70}
        />
        <Text size="sm" c="dimmed">
          {from}–{to} of {total}
        </Text>
      </Group>
      <Group gap="xs">
        <Button
          variant="default"
          size="xs"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Text size="sm" c="dimmed" px="xs">
          {page} / {totalPages}
        </Text>
        <Button
          variant="default"
          size="xs"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </Group>
    </div>
  );
}
