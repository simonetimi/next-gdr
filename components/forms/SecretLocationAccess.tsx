"use client";

import { accessOrCreateSecretLocation } from "@/server/actions/location";
import { ArrowUpRight, KeyRound } from "lucide-react";
import { FormEvent, useState } from "react";
import { Form, Input, Button, addToast } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { SECRET_LOCATION_ROUTE } from "@/utils/routes";

export function SecretLocationAccess() {
  const t = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [secretCode, setSecretCode] = useState("");

  const handleOnSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!secretCode) throw new Error(t("mustNotBeEmpty"));
      const secretCodeFromServer =
        await accessOrCreateSecretLocation(secretCode);
      router.push(SECRET_LOCATION_ROUTE + "/" + secretCodeFromServer);
    } catch (error) {
      return addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      onSubmit={handleOnSubmit}
      className="w-1/2 flex-row items-center justify-center gap-6"
    >
      <Input
        name="secretCode"
        value={secretCode}
        onChange={(e) => setSecretCode(e.target.value)}
        className="max-w-xs"
        label={t("game.locations.secret.name")}
        placeholder={t("game.locations.secret.secretCode")}
        startContent={<KeyRound className="h-4" />}
      />
      <Button
        type="submit"
        isDisabled={isSubmitting || !secretCode.trim()}
        isIconOnly
        startContent={<ArrowUpRight />}
        color="primary"
        size="sm"
      />
    </Form>
  );
}
