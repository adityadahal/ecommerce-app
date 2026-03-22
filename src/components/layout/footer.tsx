import Link from "next/link";
import { ShoppingCart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
              <ShoppingCart size={24} />
              <span>FreshMart</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Fresh groceries delivered to your door. Quality products at great prices, serving the Australian community.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/category/fruits-vegetables" className="hover:text-primary">Fruits & Vegetables</Link></li>
              <li><Link href="/category/dairy-eggs" className="hover:text-primary">Dairy & Eggs</Link></li>
              <li><Link href="/category/meat-seafood" className="hover:text-primary">Meat & Seafood</Link></li>
              <li><Link href="/category/bakery" className="hover:text-primary">Bakery</Link></li>
              <li><Link href="/category/pantry" className="hover:text-primary">Pantry</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/track" className="hover:text-primary">Track Order</Link></li>
              <li><Link href="/contact" className="hover:text-primary">Contact Us</Link></li>
              <li><Link href="/delivery" className="hover:text-primary">Delivery Information</Link></li>
              <li><Link href="/returns" className="hover:text-primary">Returns & Refunds</Link></li>
              <li><Link href="/faq" className="hover:text-primary">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Melbourne, VIC 3000</li>
              <li>support@freshmart.com.au</li>
              <li>(03) 9123 4567</li>
              <li>Mon-Sat: 8am - 8pm</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} FreshMart. All rights reserved. ABN 12 345 678 901</p>
        </div>
      </div>
    </footer>
  );
}
