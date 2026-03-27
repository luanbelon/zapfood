import { db } from "@/lib/db";
import { isDatabaseEnabled } from "@/lib/env";
import { getCurrentStore } from "@/lib/tenant";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import type { CustomerRecord, SalesSummary } from "@/lib/types";
type CustomerModel = {
  findFirst: (args: { where: { phone: string; storeId: string } }) => Promise<unknown>;
  upsert: (args: {
    where: { storeId_phone: { storeId: string; phone: string } };
    create: { phone: string; name: string; address: string; storeId: string };
    update: { name: string; address: string };
  }) => Promise<{ id: string }>;
};

type OrderModel = {
  create: (args: {
    data: {
      phone: string;
      customerId: string;
      storeId: string;
      customerName: string;
      address: string;
      total: number;
      itemsJson: string;
    };
  }) => Promise<unknown>;
  count: (args: { where: { createdAt: { gte: Date }; storeId: string } }) => Promise<number>;
};


type OrderInput = {
  phone: string;
  customerName: string;
  address: string;
  total: number;
  itemsJson: string;
};

const globalMem = globalThis as unknown as {
  zapfoodCustomers?: Record<string, CustomerRecord[]>;
  zapfoodOrders?: Record<string, Array<{ createdAt: Date }>>;
};

function customersMem(storeId: string): CustomerRecord[] {
  if (!globalMem.zapfoodCustomers) globalMem.zapfoodCustomers = {};
  if (!globalMem.zapfoodCustomers[storeId]) globalMem.zapfoodCustomers[storeId] = [];
  return globalMem.zapfoodCustomers[storeId];
}

function ordersMem(storeId: string): Array<{ createdAt: Date }> {
  if (!globalMem.zapfoodOrders) globalMem.zapfoodOrders = {};
  if (!globalMem.zapfoodOrders[storeId]) globalMem.zapfoodOrders[storeId] = [];
  return globalMem.zapfoodOrders[storeId];
}

export async function findCustomerByPhone(phoneRaw: string): Promise<CustomerRecord | null> {
  const store = await getCurrentStore();
  const phone = normalizeWhatsAppNumber(phoneRaw);
  if (!phone) return null;
  if (isDatabaseEnabled()) {
    const found = await (db as unknown as { customer: CustomerModel }).customer.findFirst({
      where: { phone, storeId: store.id },
    });
    return found as CustomerRecord | null;
  }
  return customersMem(store.id).find((c) => c.phone === phone) ?? null;
}

export async function upsertCustomerAndOrder(input: OrderInput): Promise<void> {
  const store = await getCurrentStore();
  const phone = normalizeWhatsAppNumber(input.phone);
  if (!phone) return;

  if (isDatabaseEnabled()) {
    const prismaAny = db as unknown as {
      customer: CustomerModel;
      order: OrderModel;
    };
    const customer = await prismaAny.customer.upsert({
      where: { storeId_phone: { storeId: store.id, phone } },
      create: { phone, name: input.customerName, address: input.address, storeId: store.id },
      update: { name: input.customerName, address: input.address },
    });
    await prismaAny.order.create({
      data: {
        phone,
        storeId: store.id,
        customerId: customer.id,
        customerName: input.customerName,
        address: input.address,
        total: input.total,
        itemsJson: input.itemsJson,
      },
    });
    return;
  }

  const mem = customersMem(store.id);
  const existingIdx = mem.findIndex((c) => c.phone === phone);
  const now = new Date();
  if (existingIdx >= 0) {
    mem[existingIdx] = { ...mem[existingIdx], name: input.customerName, address: input.address, updatedAt: now };
  } else {
    mem.push({
      id: `cust-${Date.now()}`,
      phone,
      name: input.customerName,
      address: input.address,
      createdAt: now,
      updatedAt: now,
    });
  }
  ordersMem(store.id).push({ createdAt: now });
}

function startOfDay(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

function startOfWeek(now: Date): Date {
  const day = now.getDay();
  const diff = (day + 6) % 7;
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff, 0, 0, 0, 0);
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export async function getSalesSummary(now = new Date()): Promise<SalesSummary> {
  const store = await getCurrentStore();
  const day = startOfDay(now);
  const week = startOfWeek(now);
  const month = startOfMonth(now);

  if (isDatabaseEnabled()) {
    const prismaAny = db as unknown as { order: OrderModel };
    const [today, weekCount, monthCount] = await Promise.all([
      prismaAny.order.count({ where: { createdAt: { gte: day }, storeId: store.id } }),
      prismaAny.order.count({ where: { createdAt: { gte: week }, storeId: store.id } }),
      prismaAny.order.count({ where: { createdAt: { gte: month }, storeId: store.id } }),
    ]);
    return { today, week: weekCount, month: monthCount };
  }

  const all = ordersMem(store.id);
  return {
    today: all.filter((o) => o.createdAt >= day).length,
    week: all.filter((o) => o.createdAt >= week).length,
    month: all.filter((o) => o.createdAt >= month).length,
  };
}
