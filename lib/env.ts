export function getStoreName(): string {
  return process.env.STORE_NAME?.trim() || "Minha Loja";
}

export function getWhatsAppNumber(): string {
  return process.env.WHATSAPP_NUMBER?.trim() || "";
}

export function getPrimaryColor(): string {
  return process.env.PRIMARY_COLOR?.trim() || "#FF3C00";
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isDatabaseEnabled(): boolean {
  return process.env.USE_DATABASE === "true" && hasDatabaseUrl();
}

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() || "admin@loja.local";
}

export function getStoreCode(): string {
  return process.env.STORE_CODE?.trim() || "1234";
}
