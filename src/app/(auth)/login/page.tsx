"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, TextInput, PasswordInput, Button, Title, Text } from "@mantine/core";
import { ShoppingCart } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder className="w-full max-w-md">
      <div className="text-center mb-4">
        <Link href="/" className="mx-auto flex items-center justify-center gap-2 text-xl font-bold text-primary mb-2">
          <ShoppingCart size={28} />
          <span>FreshMart</span>
        </Link>
        <Title order={3} className="text-2xl">Welcome back</Title>
        <Text c="dimmed" size="sm">Sign in to your account</Text>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        <TextInput
          label="Email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder="you@example.com"
          required
        />
        <PasswordInput
          label="Password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="••••••••"
          required
        />
        <Button type="submit" fullWidth color="green" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

    </Card>
  );
}
