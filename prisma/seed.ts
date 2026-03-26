import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "X-Burger",
        price: 18,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        active: true,
        promoActive: true,
        promoPrice: 14.9,
      },
      {
        name: "Coca-Cola 350ml",
        price: 6,
        image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
        active: true,
        promoActive: false,
        promoPrice: null,
      },
      {
        name: "Batata frita",
        price: 12,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
        active: true,
        promoActive: false,
        promoPrice: null,
      },
      {
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
