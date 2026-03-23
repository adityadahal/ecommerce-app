import { Text, Stack } from "@mantine/core";

type AddressDisplayProps = {
  address: { street: string; suburb: string; state: string; postcode: string };
  multiline?: boolean;
};

export function AddressDisplay({ address, multiline = false }: AddressDisplayProps) {
  if (multiline) {
    return (
      <Stack gap={2}>
        <Text size="sm" c="dimmed">{address.street}</Text>
        <Text size="sm" c="dimmed">{address.suburb}, {address.state} {address.postcode}</Text>
      </Stack>
    );
  }

  return (
    <Text size="sm" c="dimmed">
      {address.street}, {address.suburb}, {address.state} {address.postcode}
    </Text>
  );
}
