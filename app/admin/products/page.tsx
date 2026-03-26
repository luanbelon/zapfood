import { ADMIN_PRODUCTS_PATH } from "@/lib/admin-path";
import { redirect } from "next/navigation";

export default function DeprecatedAdminProductsPage() {
  redirect(ADMIN_PRODUCTS_PATH);
}
