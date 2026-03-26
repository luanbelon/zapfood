export type ProductRecord = {
  id: string;
  name: string;
  price: number;
  image: string | null;
  active: boolean;
  promoActive: boolean;
  promoPrice: number | null;
  createdAt: Date;
};

export type StoreSettings = {
  storeName: string;
  primaryColor: string;
  logoUrl: string | null;
  openTime: string;
  closeTime: string;
};

export type CustomerRecord = {
  id: string;
  phone: string;
  name: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SalesSummary = {
  today: number;
  week: number;
  month: number;
};
