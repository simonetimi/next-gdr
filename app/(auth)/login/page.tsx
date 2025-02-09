import { signIn, providerMap } from "@/auth";
import { AuthError } from "next-auth";

export default async function SignInPage(props: {
  searchParams: { callbackUrl: string | undefined };
}) {
  return (
    <div className="flex flex-col gap-2">
      {Object.values(providerMap).map((provider) => (
        <form
          key={provider.id}
          action={async () => {
            "use server";
            try {
              await signIn(provider.id, {
                redirectTo: props.searchParams?.callbackUrl ?? "",
              });
            } catch (error) {
              // TODO toast notification
              if (error instanceof AuthError) {
                console.log(error);
              }
              throw error;
            }
          }}
        >
          <button type="submit">
            <span>Log in with {provider.name}</span>
          </button>
        </form>
      ))}
    </div>
  );
}
