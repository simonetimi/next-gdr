"use client";

import { addToast } from "@heroui/react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const errors = ["OAuthAccountNotLinked"];

function LoginErrorToast({ error }: { error: string }) {
  const t = useTranslations("errors");

  useEffect(() => {
    addToast({
      title: t("login.title"),
      description: errors.includes(error) ? t(`login.${error}`) : t("generic"),
      color: "danger",
    });
  }, [error, t]);

  return null;
}

export default dynamic(() => Promise.resolve(LoginErrorToast), {
  ssr: false,
});
