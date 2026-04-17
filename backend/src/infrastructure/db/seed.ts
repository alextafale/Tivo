/**
 * TIVO — Database Seed
 * Populates the DB with initial demo data for development.
 * Run: npm run db:seed
 */
import { db } from './connection.js';
import { businesses, users, products, customers } from './schema.js';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

async function seed() {
  console.log('🌱 Seeding TIVO database...');

  // ─── 1. Business ────────────────────────────────────────────────────────────
  const [business] = await db.insert(businesses).values({
    name: 'Mi Negocio TIVO',
    phone: '555-0000',
    email: 'negocio@tivo.app',
  }).returning();

  console.log(`✅ Business: ${business.name} (${business.id})`);

  // ─── 2. Users ────────────────────────────────────────────────────────────────
  const hash = await bcrypt.hash('1234', 10);
  const [admin] = await db.insert(users).values([
    {
      businessId:   business.id,
      name:         'Admin TIVO',
      email:        'admin@tivo.app',
      passwordHash: hash,
      role:         'admin',
    },
    {
      businessId:   business.id,
      name:         'Juan Cajero',
      email:        'cajero@tivo.app',
      passwordHash: hash,
      role:         'cashier',
    },
  ]).returning();

  console.log(`✅ Users created (admin@tivo.app / 1234)`);

  // ─── 3. Products ─────────────────────────────────────────────────────────────
  await db.insert(products).values([
    { businessId: business.id, name: 'Coca-Cola 600ml', price: 18, cost: 10, stock: 48, minStock: 12, category: 'Bebidas', barcode: '7501055300006', taxRate: 0 },
    { businessId: business.id, name: 'Agua Natural 1L', price: 12, cost: 6, stock: 72, minStock: 24, category: 'Bebidas', barcode: '7502004830011', taxRate: 0 },
    { businessId: business.id, name: 'Sabritas Originales 45g', price: 16, cost: 9, stock: 5, minStock: 10, category: 'Alimentos', barcode: '7501032300051', taxRate: 0.08 },
    { businessId: business.id, name: 'Pan Bimbo Blanco 680g', price: 48, cost: 32, stock: 15, minStock: 8, category: 'Alimentos', barcode: '7501000112121', taxRate: 0 },
    { businessId: business.id, name: 'Leche Lala Entera 1L', price: 26, cost: 18, stock: 30, minStock: 12, category: 'Alimentos', barcode: '7501014000012', taxRate: 0 },
    { businessId: business.id, name: 'Jabón Dove Original', price: 32, cost: 20, stock: 3, minStock: 6, category: 'Higiene', barcode: '7501016313079', taxRate: 0.16 },
    { businessId: business.id, name: 'Detergente Ariel 1kg', price: 65, cost: 45, stock: 20, minStock: 5, category: 'Hogar', barcode: '7501007000054', taxRate: 0.16 },
    { businessId: business.id, name: 'Jugo Jumex Mango 1L', price: 22, cost: 14, stock: 24, minStock: 8, category: 'Bebidas', barcode: '7501000501112', taxRate: 0 },
    { businessId: business.id, name: 'Atún Clemente Jacques 140g', price: 22, cost: 14, stock: 36, minStock: 10, category: 'Alimentos', barcode: '7501055400016', taxRate: 0 },
    { businessId: business.id, name: 'Galletas Oreo 119g', price: 28, cost: 18, stock: 18, minStock: 6, category: 'Alimentos', barcode: '7622300153014', taxRate: 0.08 },
    { businessId: business.id, name: 'Cereal Kelloggs 500g', price: 55, cost: 38, stock: 12, minStock: 4, category: 'Alimentos', taxRate: 0 },
    { businessId: business.id, name: 'Papel Higiénico Kleenex x4', price: 42, cost: 28, stock: 2, minStock: 6, category: 'Higiene', taxRate: 0 },
  ]);

  console.log('✅ 12 products seeded');

  // ─── 4. Customers ────────────────────────────────────────────────────────────
  await db.insert(customers).values([
    { businessId: business.id, name: 'María García', email: 'maria@gmail.com', phone: '555-1234', totalPurchases: 24, totalSpent: 1840, notes: 'Cliente frecuente. Prefiere efectivo.' },
    { businessId: business.id, name: 'Carlos Rodríguez', phone: '555-5678', totalPurchases: 8, totalSpent: 620 },
    { businessId: business.id, name: 'Ana López', email: 'ana.lopez@hotmail.com', phone: '555-9012', totalPurchases: 42, totalSpent: 3200, notes: 'Pide factura siempre.' },
    { businessId: business.id, name: 'Jorge Martínez', phone: '555-3456', totalPurchases: 3, totalSpent: 180 },
  ]);

  console.log('✅ 4 customers seeded');
  console.log('\n🎉 Seed completed! Business ID:', business.id);
  console.log('   → Save this ID in your .env as BUSINESS_ID for development');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
