import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const mensOptions = [
  { type: 'COLLAR', name: 'Plain', extraPrice: 0 },
  { type: 'COLLAR', name: 'Ban', extraPrice: 150 },
  { type: 'CUFF', name: 'Plain', extraPrice: 0 },
  { type: 'CUFF', name: 'Button', extraPrice: 100 },
  { type: 'CUFF', name: 'Designer', extraPrice: 250 },
  { type: 'FRONT', name: 'Plain placket', extraPrice: 0 },
  { type: 'FRONT', name: 'Fancy placket', extraPrice: 200 },
  { type: 'POCKET', name: 'Side pockets', extraPrice: 0 },
  { type: 'POCKET', name: 'Front pocket', extraPrice: 50 },
  { type: 'TROUSER_STYLE', name: 'Shalwar', extraPrice: 0 },
  { type: 'TROUSER_STYLE', name: 'Straight', extraPrice: 100 },
  { type: 'TROUSER_STYLE', name: 'Narrow', extraPrice: 150 },
];

const womensOptions = [
  { type: 'NECKLINE', name: 'Round', extraPrice: 0 },
  { type: 'NECKLINE', name: 'V-neck', extraPrice: 100 },
  { type: 'NECKLINE', name: 'Boat', extraPrice: 150 },
  { type: 'SLEEVE', name: 'Full', extraPrice: 0 },
  { type: 'SLEEVE', name: 'Three-quarter', extraPrice: 50 },
  { type: 'SLEEVE', name: 'Bell', extraPrice: 200 },
  { type: 'SHAPE', name: 'Straight', extraPrice: 0 },
  { type: 'SHAPE', name: 'A-line', extraPrice: 150 },
  { type: 'BOTTOM_STYLE', name: 'Shalwar', extraPrice: 0 },
  { type: 'BOTTOM_STYLE', name: 'Cigarette pants', extraPrice: 150 },
  { type: 'EXTRA', name: 'Lining', extraPrice: 300 },
  { type: 'EXTRA', name: 'Dupatta finishing', extraPrice: 200 },
];

const fabrics = [
  { name: 'Cotton', pricePerMeter: 1200, extraCharge: 0 },
  { name: 'Wash & Wear', pricePerMeter: 1400, extraCharge: 300 },
  { name: 'Linen', pricePerMeter: 1600, extraCharge: 500 },
];

const designs = [
  { name: 'Classic Kurta', audience: 'MEN', category: 'KURTA', basePrice: 2800, images: ['/images/kurta.svg'] },
  { name: 'Shalwar Kameez', audience: 'MEN', category: 'SHALWAR_KAMEEZ', basePrice: 3400, images: ['/images/suit.svg'] },
  { name: 'Waistcoat', audience: 'MEN', category: 'WAISTCOAT', basePrice: 4200, images: ['/images/waistcoat.svg'] },
  { name: 'Kameez Shalwar', audience: 'WOMEN', category: 'KAMEEZ_SHALWAR', basePrice: 3900, images: ['/images/kameez.svg'] },
  { name: 'Ladies Suit', audience: 'WOMEN', category: 'SUIT', basePrice: 6500, images: ['/images/kameez.svg'] },
];

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const tailorUser = await prisma.user.upsert({
    where: { phone: '03001234567' },
    update: {},
    create: {
      name: 'Rafiq Ahmad',
      phone: '03001234567',
      email: 'rafiq@example.com',
      passwordHash,
      role: 'TAILOR',
    },
  });

  const tailor = await prisma.tailor.upsert({
    where: { userId: tailorUser.id },
    update: {},
    create: {
      userId: tailorUser.id,
      shopName: 'Rafiq Tailors',
      address: 'Main Boulevard, Gulberg III',
      city: 'Lahore',
      area: 'Gulberg',
      whatsapp: '+923001234567',
      bio: 'Custom stitching for men and women since 1998.',
      servesWomen: true,
      femaleStaff: false,
      portfolioImages: ['/images/kurta.svg', '/images/kameez.svg'],
    },
  });

  const existing = await prisma.design.count({ where: { tailorId: tailor.id } });
  if (existing === 0) {
    for (const d of designs) {
      const design = await prisma.design.create({
        data: {
          tailorId: tailor.id,
          name: d.name,
          audience: d.audience as 'MEN' | 'WOMEN',
          category: d.category as any,
          basePrice: d.basePrice,
          images: d.images,
          description: `${d.name} — stitched to your measurements in Lahore.`,
          fabrics: { create: fabrics.map((f) => ({ ...f, tailorId: tailor.id })) },
          options: {
            create: (d.audience === 'MEN' ? mensOptions : womensOptions).map((o) => ({
              tailorId: tailor.id,
              type: o.type as any,
              name: o.name,
              extraPrice: o.extraPrice,
            })),
          },
        },
      });
      await prisma.fabric.updateMany({
        where: { designId: design.id },
        data: { tailorId: tailor.id },
      });
    }
  }

  const customer = await prisma.user.upsert({
    where: { phone: '03007654321' },
    update: {},
    create: {
      name: 'Sara Khan',
      phone: '03007654321',
      email: 'customer@example.com',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const mCount = await prisma.measurement.count({ where: { customerId: customer.id } });
  if (mCount === 0) {
    await prisma.measurement.create({
      data: {
        customerId: customer.id,
        label: 'My shalwar kameez',
        garmentType: 'MEN_SHALWAR_KAMEEZ',
        values: {
          length: 40,
          chest: 40,
          waist: 38,
          shoulder: 18,
          sleeve: 23,
          neck: 15,
          daman: 24,
          shalwarLength: 42,
          shalwarWaist: 32,
          bottomWidth: 14,
        },
      },
    });
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
