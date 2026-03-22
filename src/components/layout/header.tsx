"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Menu, X, LogOut, Package, LayoutDashboard } from "lucide-react";
import { Button, Collapse, Transition } from "@mantine/core";
import { useState } from "react";
import { useLocalCart } from "@/hooks/use-cart";
import { LiveSearch } from "@/components/store/live-search";

export function Header() {
  const { data: session } = useSession();
  const { itemCount } = useLocalCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <button
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <ShoppingCart size={28} />
          <span>FreshMart</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 ml-8">
          <Link href="/category/fruits-vegetables" className="text-sm font-medium hover:text-primary">
            Fruits & Vegetables
          </Link>
          <Link href="/category/dairy-eggs" className="text-sm font-medium hover:text-primary">
            Dairy & Eggs
          </Link>
          <Link href="/category/meat-seafood" className="text-sm font-medium hover:text-primary">
            Meat & Seafood
          </Link>
          <Link href="/category/bakery" className="text-sm font-medium hover:text-primary">
            Bakery
          </Link>
          <Link href="/category/pantry" className="text-sm font-medium hover:text-primary">
            Pantry
          </Link>
        </nav>

        <div className="hidden md:block flex-1 max-w-md ml-auto">
          <LiveSearch />
        </div>

        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <Link href="/track" className="hidden sm:block">
            <Button variant="subtle" size="sm" leftSection={<Package size={16} />}>
              Track Order
            </Button>
          </Link>

          <Link href="/cart" className="relative">
            <Button variant="subtle" size="sm" className="px-2">
              <ShoppingCart size={20} />
              {itemCount > 0 && (
                <span key={itemCount} className="cart-badge-bounce absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Button>
          </Link>

          {/* Admin menu — only visible when admin is logged in */}
          {session?.user?.role === "ADMIN" && (
            <div className="relative">
              <Button variant="subtle" size="sm" className="px-2" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <User size={20} />
              </Button>
              <Transition mounted={userMenuOpen} transition="pop-top-right" duration={150}>
                {(styles) => (
                  <div style={styles} className="absolute right-0 top-full mt-2 w-48 rounded-lg border bg-white py-2 shadow-lg">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-medium">{session.user.name}</p>
                      <p className="text-xs text-muted-foreground">{session.user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut(); }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-accent"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </Transition>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      <Collapse in={mobileMenuOpen}>
        <div className="border-t lg:hidden">
          <div className="p-4">
            <LiveSearch />
          </div>
          <nav className="flex flex-col pb-4">
            <Link href="/category/fruits-vegetables" className="px-4 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>Fruits & Vegetables</Link>
            <Link href="/category/dairy-eggs" className="px-4 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>Dairy & Eggs</Link>
            <Link href="/category/meat-seafood" className="px-4 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>Meat & Seafood</Link>
            <Link href="/category/bakery" className="px-4 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>Bakery</Link>
            <Link href="/category/pantry" className="px-4 py-2 text-sm hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>Pantry</Link>
            <div className="border-t mt-2 pt-2">
              <Link href="/track" className="px-4 py-2 text-sm hover:bg-accent flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <Package size={14} />
                Track Order
              </Link>
            </div>
          </nav>
        </div>
      </Collapse>
    </header>
  );
}
