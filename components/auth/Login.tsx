import { signIn } from "@/auth";
import { Button } from "@heroui/button";
import { Github } from "lucide-react";

export default function Login() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/" });
      }}
    >
      <Button type="submit" color="primary" startContent={<Github />}>
        Login with GitHub
      </Button>
    </form>
  );
}
