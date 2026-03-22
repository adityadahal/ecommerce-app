"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, TextInput, PasswordInput, Button, Title, Text } from "@mantine/core";
import { ShoppingCart } from "lucide-react";

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
      <div className="text-center mb-4">
        <Link href="/" className="mx-auto flex items-center justify-center gap-2 text-xl font-bold text-primary mb-2">
          <ShoppingCart size={28} />
          <span>FreshMart</span>
        </Link>
        <Title order={3} className="text-2xl">Create an account</Title>
        <Text c="dimmed" size="sm">Get started with FreshMart</Text>
      </div>
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
        <Button type="submit" fullWidth color="green" disabled={loading}>
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
