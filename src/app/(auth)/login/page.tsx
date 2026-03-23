"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, TextInput, PasswordInput, Button, Title, Text, Group, ThemeIcon, Alert, Box } from "@mantine/core";
import { ShoppingCart, Lock } from "lucide-react";

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

    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) { setError("Invalid email or password"); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  };

  return (
    <Card shadow="lg" padding="xl" radius="lg" withBorder w="100%" maw={440}>
      <Box ta="center" mb="lg">
        <Box hiddenFrom="lg">
          <Group justify="center" gap="xs" mb="md">
            <ThemeIcon color="green" size="md" radius="md">
              <ShoppingCart size={16} />
            </ThemeIcon>
            <Text fw={700} size="lg">Fresh<Text span c="green" inherit>Mart</Text></Text>
          </Group>
        </Box>
        <ThemeIcon color="green" size="xl" radius="md" variant="light" mx="auto" mb="md" visibleFrom="lg">
          <Lock size={22} />
        </ThemeIcon>
        <Title order={2}>Admin Login</Title>
        <Text c="dimmed" size="sm" mt={4}>Sign in to manage your store</Text>
      </Box>

      <form onSubmit={handleSubmit}>
        {error && <Alert color="red" variant="light" mb="md">{error}</Alert>}
        <TextInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} placeholder="admin@freshmart.com.au" required size="md" mb="sm" />
        <PasswordInput label="Password" value={password} onChange={(e) => setPassword(e.currentTarget.value)} placeholder="Enter your password" required size="md" mb="md" />
        <Button type="submit" fullWidth color="green" size="md" loading={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Card>
  );
}
