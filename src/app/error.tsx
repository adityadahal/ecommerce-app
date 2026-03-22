"use client";

import { Button } from "@mantine/core";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="text-4xl font-bold text-destructive">Something went wrong</h1>
      <p className="mt-4 text-muted-foreground">
        {error.message || "An unexpected error occurred."}
      </p>
      <Button onClick={reset} color="green" className="mt-6">
        Try Again
      </Button>
    </div>
  );
}
