import { signIn } from "@/auth";

export default function Login() {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github", { redirectTo: "/" });
      }}
    >
      <button type="submit">Sign in</button>
    </form>
  );
}
