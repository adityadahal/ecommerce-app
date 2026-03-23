import { PrismaClient } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import https from "https";
import http from "http";

const prisma = new PrismaClient();
const UPLOAD_DIR = path.join(process.cwd(), "public/uploads/products");

// Map product slugs to free image URLs (Unsplash direct links, royalty-free)
const PRODUCT_IMAGES: Record<string, string[]> = {
  "organic-bananas": [
    "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop",
  ],
  "avocados": [
    "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=600&h=600&fit=crop",
  ],
  "baby-spinach": [
    "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&h=600&fit=crop",
  ],
  "royal-gala-apples": [
    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&h=600&fit=crop",
  ],
  "sweet-potato": [
    "https://images.unsplash.com/photo-1596097635121-14b63a7a6721?w=600&h=600&fit=crop",
  ],
  "broccoli": [
    "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop",
  ],
  "cherry-tomatoes": [
    "https://images.unsplash.com/photo-1546470427-0d4db154ceb8?w=600&h=600&fit=crop",
  ],
  "blueberries": [
    "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=600&h=600&fit=crop",
  ],
  "full-cream-milk-2l": [
    "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600&h=600&fit=crop",
  ],
  "free-range-eggs-12": [
    "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&h=600&fit=crop",
  ],
  "tasty-cheese-500g": [
    "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=600&h=600&fit=crop",
  ],
  "greek-yoghurt-1kg": [
    "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600&fit=crop",
  ],
  "unsalted-butter-250g": [
    "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=600&h=600&fit=crop",
  ],
  "chicken-breast-500g": [
    "https://images.unsplash.com/photo-1604503468506-a8da13d82571?w=600&h=600&fit=crop",
  ],
  "beef-mince-500g": [
    "https://images.unsplash.com/photo-1602470520998-f4a52199a3d6?w=600&h=600&fit=crop",
  ],
  "atlantic-salmon-200g": [
    "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&h=600&fit=crop",
  ],
  "pork-sausages-500g": [
    "https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=600&h=600&fit=crop",
  ],
  "sourdough-loaf": [
    "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?w=600&h=600&fit=crop",
  ],
  "croissants-4pk": [
    "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=600&h=600&fit=crop",
  ],
  "multigrain-bread": [
    "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop",
  ],
  "olive-oil-500ml": [
    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop",
  ],
  "basmati-rice-1kg": [
    "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop",
  ],
  "canned-tomatoes-400g": [
    "https://images.unsplash.com/photo-1534940519139-f860fb3c6e38?w=600&h=600&fit=crop",
  ],
  "peanut-butter-375g": [
    "https://images.unsplash.com/photo-1643647706706-adf88c4d8f88?w=600&h=600&fit=crop",
  ],
  "orange-juice-2l": [
    "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&h=600&fit=crop",
  ],
  "sparkling-water-1-25l": [
    "https://images.unsplash.com/photo-1559839914-17aae19cec71?w=600&h=600&fit=crop",
  ],
  "almond-milk-1l": [
    "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=600&h=600&fit=crop",
  ],
};

function downloadFile(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      // Follow redirects
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  console.log("Seeding product images...\n");

  await mkdir(UPLOAD_DIR, { recursive: true });

  const products = await prisma.product.findMany({ select: { id: true, slug: true, name: true } });
  let updated = 0;
  let failed = 0;

  for (const product of products) {
    const urls = PRODUCT_IMAGES[product.slug];
    if (!urls) {
      console.log(`⏭  ${product.name} — no image mapping, skipping`);
      continue;
    }

    const savedUrls: string[] = [];

    for (const url of urls) {
      try {
        console.log(`⬇  Downloading: ${product.name}...`);
        const buffer = await downloadFile(url);
        const filename = `${product.slug}-${Date.now()}.jpg`;
        await writeFile(path.join(UPLOAD_DIR, filename), buffer);
        savedUrls.push(`/uploads/products/${filename}`);
        console.log(`✅ Saved: ${filename} (${(buffer.length / 1024).toFixed(0)}KB)`);
      } catch (err) {
        console.error(`❌ Failed: ${product.name} — ${err}`);
        failed++;
      }
    }

    if (savedUrls.length > 0) {
      await prisma.product.update({
        where: { id: product.id },
        data: { images: savedUrls },
      });
      updated++;
    }
  }

  console.log(`\nDone! Updated ${updated} products, ${failed} failures.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
