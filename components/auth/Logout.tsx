import { signOut } from "@/auth";
import { Button } from "@heroui/button";

export function Logout() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut();
      }}
    >
      <Button type="submit" color="danger">
        Logout
      </Button>
    </form>
  );
}
