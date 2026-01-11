import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { id: 'fruits', name: 'Fruits & Vegetables' },
  { id: 'dairy', name: 'Dairy & Eggs' },
  { id: 'bakery', name: 'Bakery' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'snacks', name: 'Snacks' },
  { id: 'general', name: 'General' },
  { id: 'meat', name: 'Meat & Seafood' },
  { id: 'pantry', name: 'Pantry' },
  { id: 'vegetables', name: 'Vegetables' },
];

const products = [
  {
    name: 'Organic Bananas',
    barcode: '4011',
    unitType: 'weight',
    unit: 'kg',
    stock: 150,
    buyPrice: 1.2,
    sellPrice: 2.5,
    categoryId: 'fruits',
    image: 'https://placehold.co/600x400?text=Bananas',
  },
  {
    name: 'Red Apple',
    barcode: '3283',
    unitType: 'weight',
    unit: 'kg',
    stock: 100,
    buyPrice: 0.8,
    sellPrice: 1.5,
    categoryId: 'fruits',
    image: 'https://placehold.co/600x400?text=Apple',
  },
  {
    name: 'Whole Milk',
    barcode: '1234567890123',
    unitType: 'piece',
    unit: 'L',
    stock: 50,
    buyPrice: 1.0,
    sellPrice: 1.8,
    categoryId: 'dairy',
    image: 'https://placehold.co/600x400?text=Milk',
  },
  {
    name: 'Sourdough Bread',
    barcode: '2234567890123',
    unitType: 'piece',
    unit: 'loaf',
    stock: 20,
    buyPrice: 2.0,
    sellPrice: 4.5,
    categoryId: 'bakery',
    image: 'https://placehold.co/600x400?text=Bread',
  },
  {
    name: 'Orange Juice',
    barcode: '3234567890123',
    unitType: 'piece',
    unit: 'L',
    stock: 30,
    buyPrice: 1.5,
    sellPrice: 3.0,
    categoryId: 'beverages',
    image: 'https://placehold.co/600x400?text=Juice',
  },
  {
    name: 'Cheddar Cheese',
    barcode: '4234567890123',
    unitType: 'weight',
    unit: 'kg',
    stock: 40,
    buyPrice: 8.0,
    sellPrice: 15.0,
    categoryId: 'dairy',
    image: 'https://placehold.co/600x400?text=Cheese',
  },
  {
    name: 'Espresso Coffee Beans',
    barcode: '5234567890123',
    unitType: 'piece',
    unit: 'bag',
    stock: 25,
    buyPrice: 10.0,
    sellPrice: 22.0,
    categoryId: 'coffee',
    image: 'https://placehold.co/600x400?text=Coffee',
  },
  {
    name: 'Dark Chocolate',
    barcode: '6234567890123',
    unitType: 'piece',
    unit: 'bar',
    stock: 60,
    buyPrice: 1.5,
    sellPrice: 3.5,
    categoryId: 'snacks',
    image: 'https://placehold.co/600x400?text=Chocolate',
  },
  {
    name: 'Olive Oil',
    barcode: '7234567890123',
    unitType: 'piece',
    unit: 'L',
    stock: 35,
    buyPrice: 5.0,
    sellPrice: 12.0,
    categoryId: 'pantry',
    image: 'https://placehold.co/600x400?text=Olive+Oil',
  },
  {
    name: 'Pasta (Spaghetti)',
    barcode: '8234567890123',
    unitType: 'piece',
    unit: 'pack',
    stock: 80,
    buyPrice: 0.8,
    sellPrice: 1.9,
    categoryId: 'pantry',
    image: 'https://placehold.co/600x400?text=Pasta',
  },
  {
    name: 'Avocado',
    barcode: '9234567890123',
    unitType: 'piece',
    unit: 'pcs',
    stock: 40,
    buyPrice: 1.0,
    sellPrice: 2.5,
    categoryId: 'fruits',
    image: 'https://placehold.co/600x400?text=Avocado',
  },
  {
    name: 'Tomato',
    barcode: '1023456789012',
    unitType: 'weight',
    unit: 'kg',
    stock: 60,
    buyPrice: 1.5,
    sellPrice: 3.0,
    categoryId: 'vegetables',
    image: 'https://placehold.co/600x400?text=Tomato',
  },
  {
    name: 'Cucumber',
    barcode: '1123456789012',
    unitType: 'weight',
    unit: 'kg',
    stock: 50,
    buyPrice: 1.0,
    sellPrice: 2.0,
    categoryId: 'vegetables',
    image: 'https://placehold.co/600x400?text=Cucumber',
  },
  {
    name: 'Carrot',
    barcode: '1223456789012',
    unitType: 'weight',
    unit: 'kg',
    stock: 70,
    buyPrice: 0.5,
    sellPrice: 1.2,
    categoryId: 'vegetables',
    image: 'https://placehold.co/600x400?text=Carrot',
  },
  {
    name: 'Potato',
    barcode: '1323456789012',
    unitType: 'weight',
    unit: 'kg',
    stock: 200,
    buyPrice: 0.4,
    sellPrice: 1.0,
    categoryId: 'vegetables',
    image: 'https://placehold.co/600x400?text=Potato',
  },
  {
    name: 'Chicken Breast',
    barcode: '1423456789012',
    unitType: 'weight',
    unit: 'kg',
    stock: 30,
    buyPrice: 5.0,
    sellPrice: 9.0,
    categoryId: 'meat',
    image: 'https://placehold.co/600x400?text=Chicken',
  },
  {
    name: 'Salmon Fillet',
    barcode: '1523456789012',
    unitType: 'weight',
    unit: 'kg',
    stock: 15,
    buyPrice: 12.0,
    sellPrice: 25.0,
    categoryId: 'meat',
    image: 'https://placehold.co/600x400?text=Salmon',
  },
  {
    name: 'Cola Can',
    barcode: '1623456789012',
    unitType: 'piece',
    unit: 'can',
    stock: 100,
    buyPrice: 0.5,
    sellPrice: 1.2,
    categoryId: 'beverages',
    image: 'https://placehold.co/600x400?text=Cola',
  },
  {
    name: 'Mineral Water',
    barcode: '1723456789012',
    unitType: 'piece',
    unit: 'bottle',
    stock: 120,
    buyPrice: 0.3,
    sellPrice: 1.0,
    categoryId: 'beverages',
    image: 'https://placehold.co/600x400?text=Water',
  },
  {
    name: 'Chips',
    barcode: '1823456789012',
    unitType: 'piece',
    unit: 'pack',
    stock: 60,
    buyPrice: 1.0,
    sellPrice: 2.2,
    categoryId: 'snacks',
    image: 'https://placehold.co/600x400?text=Chips',
  },
];

async function main() {
  console.log('Start seeding...');
  
  // Create categories
  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }

  // Create Users
  const users = [
      { username: 'admin1', password: '123', role: 'admin', name: 'System Admin' },
      { username: 'cashier1', password: '123', role: 'cashier', name: 'Mahmud Kessir' },
      { username: 'manager1', password: '123', role: 'manager', name: 'Boss Man' },
      { username: 'courier1', password: '123', role: 'courier', name: 'Fast Boi' },
      { username: 'storage1', password: '123', role: 'storage', name: 'Warehouse Guy' }
  ];

  for (const user of users) {
      await prisma.user.upsert({
          where: { username: user.username },
          update: {},
          create: user
      });
      console.log(`Upserted user: ${user.username}`);
  }

  // Create products
  for (const product of products) {
    await prisma.product.upsert({
        where: { barcode: product.barcode },
        update: product,
        create: product
    });
    console.log(`Upserted product: ${product.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
