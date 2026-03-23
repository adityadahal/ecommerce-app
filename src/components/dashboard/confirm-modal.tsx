"use client";

import { Modal, Button, Text, Group } from "@mantine/core";
import { AlertTriangle } from "lucide-react";

type Props = {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  loading = false,
  title = "Confirm Delete",
  message = "Are you sure? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="sm">
      <div className="flex gap-3 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle size={20} className="text-red-600" />
        </div>
        <Text size="sm" c="dimmed">{message}</Text>
      </div>
      <Group justify="flex-end">
        <Button variant="default" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button color="red" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </Group>
    </Modal>
  );
}
