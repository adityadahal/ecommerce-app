import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@freshmart.com.au" },
    update: {},
    create: {
      email: "admin@freshmart.com.au",
      name: "Admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Admin user created:", admin.email);

  // Create demo customer
  const customerPassword = await bcrypt.hash("customer123", 12);
  await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      name: "Jane Smith",
      password: customerPassword,
      role: "CUSTOMER",
    },
  });

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "fruits-vegetables" },
      update: {},
      create: { name: "Fruits & Vegetables", slug: "fruits-vegetables", image: "🥬" },
    }),
    prisma.category.upsert({
      where: { slug: "dairy-eggs" },
      update: {},
      create: { name: "Dairy & Eggs", slug: "dairy-eggs", image: "🥛" },
    }),
    prisma.category.upsert({
      where: { slug: "meat-seafood" },
      update: {},
      create: { name: "Meat & Seafood", slug: "meat-seafood", image: "🥩" },
    }),
    prisma.category.upsert({
      where: { slug: "bakery" },
      update: {},
      create: { name: "Bakery", slug: "bakery", image: "🍞" },
    }),
    prisma.category.upsert({
      where: { slug: "pantry" },
      update: {},
      create: { name: "Pantry", slug: "pantry", image: "🫙" },
    }),
    prisma.category.upsert({
      where: { slug: "beverages" },
      update: {},
      create: { name: "Beverages", slug: "beverages", image: "🧃" },
    }),
  ]);

  const [fruitsVeg, dairy, meat, bakery, pantry, beverages] = categories;
  console.log("Categories created:", categories.length);

  // Create products
  const products = [
    // Fruits & Vegetables
    { name: "Organic Bananas", slug: "organic-bananas", description: "Sweet, ripe organic bananas from Queensland. Perfect for smoothies, baking, or snacking.", price: 4.50, compareAtPrice: 5.99, categoryId: fruitsVeg.id, stock: 150, unit: "bunch", isFeatured: true, images: [] },
    { name: "Avocados", slug: "avocados", description: "Premium Hass avocados, perfectly ripe and ready to eat.", price: 2.50, categoryId: fruitsVeg.id, stock: 80, unit: "each", isFeatured: true, images: [] },
    { name: "Baby Spinach 120g", slug: "baby-spinach", description: "Fresh baby spinach leaves, pre-washed and ready to use.", price: 3.00, categoryId: fruitsVeg.id, stock: 60, unit: "pack", images: [] },
    { name: "Royal Gala Apples 1kg", slug: "royal-gala-apples", description: "Crisp and sweet Royal Gala apples, perfect for lunch boxes.", price: 5.50, categoryId: fruitsVeg.id, stock: 100, unit: "kg", isFeatured: true, images: [] },
    { name: "Sweet Potato", slug: "sweet-potato", description: "Australian grown sweet potatoes, great for roasting.", price: 4.00, categoryId: fruitsVeg.id, stock: 90, unit: "kg", images: [] },
    { name: "Broccoli", slug: "broccoli", description: "Fresh green broccoli heads.", price: 3.50, categoryId: fruitsVeg.id, stock: 70, unit: "each", images: [] },
    { name: "Cherry Tomatoes 250g", slug: "cherry-tomatoes", description: "Sweet vine-ripened cherry tomatoes.", price: 4.00, compareAtPrice: 5.00, categoryId: fruitsVeg.id, stock: 55, unit: "pack", images: [] },
    { name: "Blueberries 125g", slug: "blueberries", description: "Plump, fresh blueberries packed with antioxidants.", price: 5.00, categoryId: fruitsVeg.id, stock: 40, unit: "pack", isFeatured: true, images: [] },

    // Dairy & Eggs
    { name: "Full Cream Milk 2L", slug: "full-cream-milk-2l", description: "Fresh Australian full cream milk.", price: 3.60, categoryId: dairy.id, stock: 200, unit: "each", isFeatured: true, images: [] },
    { name: "Free Range Eggs 12pk", slug: "free-range-eggs-12", description: "Free range eggs from happy hens.", price: 6.50, categoryId: dairy.id, stock: 120, unit: "dozen", isFeatured: true, images: [] },
    { name: "Tasty Cheese Block 500g", slug: "tasty-cheese-500g", description: "Classic Australian tasty cheese.", price: 7.00, categoryId: dairy.id, stock: 80, unit: "each", images: [] },
    { name: "Greek Yoghurt 1kg", slug: "greek-yoghurt-1kg", description: "Thick and creamy Greek style yoghurt.", price: 6.00, compareAtPrice: 7.50, categoryId: dairy.id, stock: 60, unit: "each", images: [] },
    { name: "Unsalted Butter 250g", slug: "unsalted-butter-250g", description: "Pure cream unsalted butter.", price: 4.50, categoryId: dairy.id, stock: 100, unit: "each", images: [] },

    // Meat & Seafood
    { name: "Chicken Breast 500g", slug: "chicken-breast-500g", description: "Free range chicken breast fillets.", price: 10.00, categoryId: meat.id, stock: 50, unit: "pack", isFeatured: true, images: [] },
    { name: "Beef Mince 500g", slug: "beef-mince-500g", description: "Premium lean beef mince, perfect for bolognese.", price: 9.00, categoryId: meat.id, stock: 60, unit: "pack", images: [] },
    { name: "Atlantic Salmon 200g", slug: "atlantic-salmon-200g", description: "Fresh Atlantic salmon fillets.", price: 12.00, compareAtPrice: 14.99, categoryId: meat.id, stock: 30, unit: "pack", isFeatured: true, images: [] },
    { name: "Pork Sausages 500g", slug: "pork-sausages-500g", description: "Traditional Australian pork sausages.", price: 7.50, categoryId: meat.id, stock: 45, unit: "pack", images: [] },

    // Bakery
    { name: "Sourdough Loaf", slug: "sourdough-loaf", description: "Artisan sourdough bread, baked fresh daily.", price: 6.50, categoryId: bakery.id, stock: 30, unit: "each", isFeatured: true, images: [] },
    { name: "Croissants 4pk", slug: "croissants-4pk", description: "Buttery French-style croissants.", price: 5.50, categoryId: bakery.id, stock: 25, unit: "pack", images: [] },
    { name: "Multigrain Bread", slug: "multigrain-bread", description: "Hearty multigrain sandwich bread.", price: 4.50, categoryId: bakery.id, stock: 40, unit: "each", images: [] },

    // Pantry
    { name: "Extra Virgin Olive Oil 500ml", slug: "olive-oil-500ml", description: "Premium Australian extra virgin olive oil.", price: 10.00, categoryId: pantry.id, stock: 80, unit: "each", images: [] },
    { name: "Basmati Rice 1kg", slug: "basmati-rice-1kg", description: "Premium long grain basmati rice.", price: 5.00, categoryId: pantry.id, stock: 100, unit: "each", images: [] },
    { name: "Canned Tomatoes 400g", slug: "canned-tomatoes-400g", description: "Italian style diced tomatoes in juice.", price: 1.50, compareAtPrice: 2.00, categoryId: pantry.id, stock: 200, unit: "each", images: [] },
    { name: "Peanut Butter 375g", slug: "peanut-butter-375g", description: "Smooth peanut butter, no added sugar.", price: 5.50, categoryId: pantry.id, stock: 70, unit: "each", images: [] },

    // Beverages
    { name: "Orange Juice 2L", slug: "orange-juice-2l", description: "Freshly squeezed orange juice, no concentrate.", price: 6.00, categoryId: beverages.id, stock: 60, unit: "each", images: [] },
    { name: "Sparkling Water 1.25L", slug: "sparkling-water-1-25l", description: "Natural sparkling mineral water.", price: 2.00, categoryId: beverages.id, stock: 120, unit: "each", images: [] },
    { name: "Almond Milk 1L", slug: "almond-milk-1l", description: "Unsweetened almond milk, dairy free.", price: 4.50, compareAtPrice: 5.50, categoryId: beverages.id, stock: 50, unit: "each", images: [] },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }
  console.log("Products created:", products.length);

  // Create delivery zones
  await prisma.deliveryZone.createMany({
    skipDuplicates: true,
    data: [
      { name: "Melbourne CBD", postcodeFrom: "3000", postcodeTo: "3010", deliveryFee: 5.95, minOrderForFree: 50 },
      { name: "Inner Melbourne", postcodeFrom: "3011", postcodeTo: "3100", deliveryFee: 7.95, minOrderForFree: 75 },
      { name: "Outer Melbourne", postcodeFrom: "3101", postcodeTo: "3200", deliveryFee: 9.95, minOrderForFree: 100 },
    ],
  });
  console.log("Delivery zones created");

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
