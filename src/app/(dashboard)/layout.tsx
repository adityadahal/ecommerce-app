"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Truck, BarChart3, LogOut, ShoppingCart } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@mantine/core";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/categories", label: "Categories", icon: FolderTree },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/delivery-zones", label: "Delivery Zones", icon: Truck },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 border-r bg-white md:block">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <ShoppingCart size={24} className="text-primary" />
          <span className="font-bold text-lg">FreshMart</span>
          <span className="text-xs bg-primary text-white rounded px-1.5 py-0.5 ml-1">Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
          <div className="border-t pt-2 mt-4">
            <Link href="/" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent">
              <BarChart3 size={18} />
              View Store
            </Link>
            <Button
              variant="subtle"
              color="red"
              fullWidth
              justify="flex-start"
              leftSection={<LogOut size={18} />}
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-1"
            >
              Sign Out
            </Button>
          </div>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex h-16 items-center border-b bg-white px-6">
          <h1 className="text-lg font-semibold">Admin Dashboard</h1>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
