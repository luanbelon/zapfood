import { PrismaClient } from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();
const hash = (v: string) => createHash("sha256").update(v).digest("hex");

async function main() {
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.storeConfig.deleteMany();
  await prisma.adminUser.deleteMany();
  await prisma.store.deleteMany();

  const store = await prisma.store.create({
    data: {
      name: "Loja Demo",
      code: "DEMO01",
      subdomain: "demo",
      admins: {
        create: {
          email: process.env.ADMIN_EMAIL ?? "admin@loja.local",
          role: "STORE_ADMIN",
          passwordHash: hash(process.env.ADMIN_PASSWORD ?? "troque-esta-senha"),
        },
      },
      config: {
        create: {
          storeName: process.env.STORE_NAME ?? "Loja Demo",
          primaryColor: process.env.PRIMARY_COLOR ?? "#FF3C00",
          openTime: process.env.STORE_OPEN_TIME ?? "09:00",
          closeTime: process.env.STORE_CLOSE_TIME ?? "22:00",
        },
      },
    },
  });

  await prisma.product.createMany({
    data: [
      {
        storeId: store.id,
        name: "X-Burger",
        price: 18,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        active: true,
        promoActive: true,
        promoPrice: 14.9,
      },
      {
        storeId: store.id,
        name: "Coca-Cola 350ml",
        price: 6,
        image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
        active: true,
        promoActive: false,
        promoPrice: null,
      },
      {
        storeId: store.id,
        name: "Batata frita",
        price: 12,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
        active: true,
        promoActive: false,
        promoPrice: null,
      },
      {
        storeId: store.id,
        name: "Item inativo (teste)",
        price: 99,
        active: false,
        promoActive: false,
        promoPrice: null,
      },
    ],
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
