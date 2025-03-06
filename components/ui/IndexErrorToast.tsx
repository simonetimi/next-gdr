"use client";

import { addToast } from "@heroui/react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect } from "react";

const errors = ["OAuthAccountNotLinked", "Configuration"];

function IndexErrorToast({ error }: { error: string }) {
  const t = useTranslations("errors");

  useEffect(() => {
    addToast({
      title: t("title"),
      description: errors.includes(error) ? t(`index.${error}`) : t("unknown"),
      color: "danger",
    });
  }, [error, t]);

  return null;
}

export default dynamic(() => Promise.resolve(IndexErrorToast), {
  ssr: false,
});
