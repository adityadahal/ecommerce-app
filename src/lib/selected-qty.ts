const KEY_PREFIX = "mvm-qty-";

export function getSelectedQty(productId: string): number {
  if (typeof window === "undefined") return 1;
  const val = sessionStorage.getItem(KEY_PREFIX + productId);
  return val ? parseInt(val, 10) || 1 : 1;
}

export function setSelectedQty(productId: string, qty: number) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY_PREFIX + productId, String(qty));
}
