type AddressDisplayProps = {
  address: {
    street: string;
    suburb: string;
    state: string;
    postcode: string;
  };
  /** Use line break between street and suburb/state/postcode */
  multiline?: boolean;
};

export function AddressDisplay({ address, multiline = false }: AddressDisplayProps) {
  if (multiline) {
    return (
      <p className="text-sm text-muted-foreground">
        {address.street}
        <br />
        {address.suburb} {address.state} {address.postcode}
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      {address.street}, {address.suburb} {address.state} {address.postcode}
    </p>
  );
}
