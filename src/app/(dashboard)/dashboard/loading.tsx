import { Skeleton } from "@mantine/core";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Skeleton height={32} width={192} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height={128} radius="md" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton height={256} radius="md" />
        <Skeleton height={256} radius="md" />
      </div>
    </div>
  );
}
