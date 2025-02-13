import { signIn } from "@/auth";
import { Button } from "@heroui/button";
import { Github } from "lucide-react";

// TODO replace lucide github icon with svg

export default async function Login() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
    >
      <Button type="submit" color="primary" startContent={<Github />}>
        Login with GitHub
      </Button>
    </form>
  );
}
