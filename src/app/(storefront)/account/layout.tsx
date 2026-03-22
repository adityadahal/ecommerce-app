import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-4">
          <nav className="space-y-1">
            <h2 className="mb-4 text-lg font-semibold">My Account</h2>
            <Link href="/account" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Profile</Link>
            <Link href="/account/orders" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Orders</Link>
            <Link href="/account/addresses" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">Addresses</Link>
          </nav>
          <div className="md:col-span-3">{children}</div>
        </div>
      </div>
      <Footer />
    </>
  );
}
