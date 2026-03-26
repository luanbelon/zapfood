import { ADMIN_BASE_PATH } from "@/lib/admin-path";
import { redirect } from "next/navigation";

export default function DeprecatedAdminLayout() {
  redirect(ADMIN_BASE_PATH);
}
