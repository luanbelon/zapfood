import { db } from "@/lib/db";
import { isDatabaseEnabled } from "@/lib/env";
import type { ProductRecord } from "@/lib/types";

type ProductCreateInput = {
  name: string;
  price: number;
  image: string | null;
  active: boolean;
  promoActive: boolean;
  promoPrice: number | null;
};

type ProductUpdateInput = {
  name?: string;
  price?: number;
  image?: string | null;
  active?: boolean;
  promoActive?: boolean;
  promoPrice?: number | null;
};

const globalForMock = globalThis as unknown as {
  zapfoodMockProducts?: ProductRecord[];
};

function getMockStore(): ProductRecord[] {
  if (!globalForMock.zapfoodMockProducts) {
    globalForMock.zapfoodMockProducts = [
      {
        id: "mock-1",
        name: "X-Burger",
        price: 18,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
        active: true,
        promoActive: true,
        promoPrice: 14.9,
        createdAt: new Date(),
      },
      {
        id: "mock-2",
        name: "Coca-Cola 350ml",
        price: 6,
        image: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400",
        active: true,
        promoActive: false,
        promoPrice: null,
        createdAt: new Date(),
      },
      {
        id: "mock-3",
        name: "Batata frita",
        price: 12,
        image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400",
        active: true,
        promoActive: false,
        promoPrice: null,
        createdAt: new Date(),
      },
    ];
  }
  return globalForMock.zapfoodMockProducts;
}

function sortByNewest(items: ProductRecord[]): ProductRecord[] {
  return [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function listProducts(includeInactive: boolean): Promise<ProductRecord[]> {
  if (isDatabaseEnabled()) {
    return (await db.product.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { createdAt: "desc" },
    })) as ProductRecord[];
  }
  const items = getMockStore();
  const filtered = includeInactive ? items : items.filter((p) => p.active);
  return sortByNewest(filtered);
}

export async function createProduct(input: ProductCreateInput): Promise<ProductRecord> {
  if (isDatabaseEnabled()) {
    return (await db.product.create({ data: input })) as ProductRecord;
  }
  const items = getMockStore();
  const created: ProductRecord = {
    id: `mock-${Date.now()}`,
    createdAt: new Date(),
    ...input,
  };
  items.unshift(created);
  return created;
}

export async function updateProduct(
  id: string,
  input: ProductUpdateInput,
): Promise<ProductRecord | null> {
  if (isDatabaseEnabled()) {
    try {
      return (await db.product.update({ where: { id }, data: input })) as ProductRecord;
    } catch {
      return null;
    }
  }
  const items = getMockStore();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...input };
  return items[idx];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isDatabaseEnabled()) {
    try {
      await db.product.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
  const items = getMockStore();
  const before = items.length;
  globalForMock.zapfoodMockProducts = items.filter((p) => p.id !== id);
  return globalForMock.zapfoodMockProducts.length < before;
}

export async function countProducts(): Promise<{ total: number; active: number; inactive: number }> {
  if (isDatabaseEnabled()) {
    const [total, active, inactive] = await Promise.all([
      db.product.count(),
      db.product.count({ where: { active: true } }),
      db.product.count({ where: { active: false } }),
    ]);
    return { total, active, inactive };
  }
  const items = getMockStore();
  const total = items.length;
  const active = items.filter((p) => p.active).length;
  const inactive = total - active;
  return { total, active, inactive };
}
