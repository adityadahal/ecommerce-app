import { formatPrice } from "@/lib/utils";

type OrderSummaryProps = {
  subtotal: number;
  gst: number;
  deliveryFee: number;
  total: number;
  /** Show "X away from free delivery" hint */
  showFreeDeliveryHint?: boolean;
};

export function OrderSummary({
  subtotal,
  gst,
  deliveryFee,
  total,
  showFreeDeliveryHint = false,
}: OrderSummaryProps) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span>GST (included)</span>
        <span>{formatPrice(gst)}</span>
      </div>
      <div className="flex justify-between">
        <span>Delivery</span>
        <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
      </div>
      {showFreeDeliveryHint && deliveryFee > 0 && (
        <p className="text-xs text-muted-foreground">
          Free delivery on orders over $75 (${(75 - subtotal).toFixed(2)} away)
        </p>
      )}
      <div className="border-t pt-2 flex justify-between font-bold text-base">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}
