import { redirect } from "next/navigation";
import { MASTER_STORES_PATH } from "@/lib/admin-path";

export default function MasterIndexPage() {
  redirect(MASTER_STORES_PATH);
}
