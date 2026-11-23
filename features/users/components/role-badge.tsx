import { Badge } from "@/components/ui/badge";
import { messages } from "@/config/messages";
import type { Role } from "@/config/permissions";

const TONES: Record<Role, "brand" | "info" | "neutral" | "success"> = {
  SUPER_ADMIN: "brand",
  SELLER: "info",
  ACCOUNTANT: "success",
  USER: "neutral",
};

/** The role as a readable label, never the raw enum value. */
export function RoleBadge({ role }: { role: Role }) {
  return <Badge tone={TONES[role]}>{messages.roles[role]}</Badge>;
}
