import { signIn, providerMap } from "@/auth";
import { AuthError } from "next-auth";
import { addToast } from "@heroui/react";
import { getTranslations } from "next-intl/server";
import { Logger } from "@/utils/logger";

export default async function SignInPage(props: {
  searchParams: Promise<{ callbackUrl: string | undefined }>;
}) {
  const t = await getTranslations("errors");
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-col gap-2">
      {Object.values(providerMap).map((provider) => (
        <form
          key={provider.id}
          action={async () => {
            "use server";
            try {
              await signIn(provider.id, {
                redirectTo: searchParams?.callbackUrl ?? "",
              });
            } catch (error) {
              Logger.error(error);
              let errorMessage = t("generic");
              if (error instanceof AuthError) {
                errorMessage = error.message;
              }
              addToast({
                title: t("title"),
                description: errorMessage,
                color: "danger",
              });
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
