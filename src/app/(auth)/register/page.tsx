"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, TextInput, PasswordInput, Button, Title, Text, Group, Box } from "@mantine/core";
import Image from "next/image";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="w-full max-w-md">
      <Box ta="center" mb="md">
        <Link href="/" style={{ textDecoration: "none" }}>
          <Group justify="center" gap="xs" mb="md">
            <Image src="/logo-icon.svg" alt="Lumbini" width={36} height={36} style={{ borderRadius: "var(--mantine-radius-md)" }} />
            <Box>
              <Text fw={700} size="sm" c="#800000" lh={1.1}>LUMBINI</Text>
              <Text size="xs" c="#DFA031" fw={600} lh={1}>MEAT & GROCERY</Text>
            </Box>
          </Group>
        </Link>
        <Title order={3} className="text-2xl">Create an account</Title>
        <Text c="dimmed" size="sm">Get started with Lumbini Meat & Grocery</Text>
      </Box>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <TextInput
          label="Full Name"
          id="name"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="John Smith"
          required
        />
        <TextInput
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="you@example.com"
          required
        />
        <div>
          <PasswordInput
            label="Password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            placeholder="••••••••"
            minLength={8}
            required
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
        </div>
        <Button type="submit" fullWidth color="maroon" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
