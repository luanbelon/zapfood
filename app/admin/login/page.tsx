import { ADMIN_LOGIN_PATH } from "@/lib/admin-path";
import { redirect } from "next/navigation";

export default function DeprecatedAdminLoginPage() {
  redirect(ADMIN_LOGIN_PATH);
}
