import { Text, Stack } from "@mantine/core";

type AddressDisplayProps = {
  address: { street: string; suburb: string; state?: string; postcode: string };
  multiline?: boolean;
};

export function AddressDisplay({ address, multiline = false }: AddressDisplayProps) {
  const location = [address.suburb, address.state, address.postcode].filter(Boolean).join(", ");

  if (multiline) {
    return (
      <Stack gap={2}>
        <Text size="sm" c="dimmed">{address.street}</Text>
        <Text size="sm" c="dimmed">{location}</Text>
      </Stack>
    );
  }

  return (
    <Text size="sm" c="dimmed">
      {address.street}, {location}
    </Text>
  );
}
