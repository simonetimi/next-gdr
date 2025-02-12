import { signOut } from "@/auth";
import { INDEX_ROUTE } from "@/utils/routes";
import { Button } from "@heroui/button";
import { LogOut } from "lucide-react";

export function Logout({ className }: { className?: string }) {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: INDEX_ROUTE });
      }}
    >
      <Button
        type="submit"
        color="danger"
        startContent={<LogOut />}
        className={`${className} p-2`}
        isIconOnly
        size="sm"
      />
    </form>
  );
}
