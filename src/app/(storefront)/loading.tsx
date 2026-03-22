import { Skeleton } from "@mantine/core";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton height={40} width={256} mb="md" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton height={0} className="aspect-square rounded-lg" style={{ paddingBottom: "100%" }} />
            <Skeleton height={16} width="75%" />
            <Skeleton height={24} width="50%" />
            <Skeleton height={36} width="100%" />
          </div>
        ))}
      </div>
    </div>
  );
}
