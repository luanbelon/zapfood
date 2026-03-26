import { db } from "@/lib/db";
import { isDatabaseEnabled } from "@/lib/env";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";
import type { CustomerRecord, SalesSummary } from "@/lib/types";
type CustomerModel = {
  findUnique: (args: { where: { phone: string } }) => Promise<unknown>;
  upsert: (args: {
    where: { phone: string };
    create: { phone: string; name: string; address: string };
    update: { name: string; address: string };
  }) => Promise<{ id: string }>;
};

type OrderModel = {
  create: (args: {
    data: {
      phone: string;
      customerId: string;
      customerName: string;
      address: string;
      total: number;
      itemsJson: string;
    };
  }) => Promise<unknown>;
  count: (args: { where: { createdAt: { gte: Date } } }) => Promise<number>;
};


type OrderInput = {
  phone: string;
  customerName: string;
  address: string;
  total: number;
  itemsJson: string;
};

const globalMem = globalThis as unknown as {
  zapfoodCustomers?: CustomerRecord[];
  zapfoodOrders?: Array<{ createdAt: Date }>;
};

function customersMem(): CustomerRecord[] {
  if (!globalMem.zapfoodCustomers) globalMem.zapfoodCustomers = [];
  return globalMem.zapfoodCustomers;
}

function ordersMem(): Array<{ createdAt: Date }> {
  if (!globalMem.zapfoodOrders) globalMem.zapfoodOrders = [];
  return globalMem.zapfoodOrders;
}

export async function findCustomerByPhone(phoneRaw: string): Promise<CustomerRecord | null> {
  const phone = normalizeWhatsAppNumber(phoneRaw);
  if (!phone) return null;
  if (isDatabaseEnabled()) {
    const found = await (db as unknown as { customer: CustomerModel }).customer.findUnique({
      where: { phone },
    });
    return found as CustomerRecord | null;
  }
  return customersMem().find((c) => c.phone === phone) ?? null;
}

export async function upsertCustomerAndOrder(input: OrderInput): Promise<void> {
  const phone = normalizeWhatsAppNumber(input.phone);
  if (!phone) return;

  if (isDatabaseEnabled()) {
    const prismaAny = db as unknown as {
      customer: CustomerModel;
      order: OrderModel;
    };
    const customer = await prismaAny.customer.upsert({
      where: { phone },
      create: { phone, name: input.customerName, address: input.address },
      update: { name: input.customerName, address: input.address },
    });
    await prismaAny.order.create({
      data: {
        phone,
        customerId: customer.id,
        customerName: input.customerName,
        address: input.address,
        total: input.total,
        itemsJson: input.itemsJson,
      },
    });
    return;
  }

  const mem = customersMem();
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
  ordersMem().push({ createdAt: now });
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
  const day = startOfDay(now);
  const week = startOfWeek(now);
  const month = startOfMonth(now);

  if (isDatabaseEnabled()) {
    const prismaAny = db as unknown as { order: OrderModel };
    const [today, weekCount, monthCount] = await Promise.all([
      prismaAny.order.count({ where: { createdAt: { gte: day } } }),
      prismaAny.order.count({ where: { createdAt: { gte: week } } }),
      prismaAny.order.count({ where: { createdAt: { gte: month } } }),
    ]);
    return { today, week: weekCount, month: monthCount };
  }

  const all = ordersMem();
  return {
    today: all.filter((o) => o.createdAt >= day).length,
    week: all.filter((o) => o.createdAt >= week).length,
    month: all.filter((o) => o.createdAt >= month).length,
  };
}
