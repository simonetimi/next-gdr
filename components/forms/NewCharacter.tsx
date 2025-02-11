"use client";

import { Race } from "@/models/characters";
import { Form } from "@heroui/form";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function NewCharacterForm({ races }: { races: Race[] }) {
  const [submitted, setSubmitted] = useState(null);
  const t = useTranslations("pages.newCharacter");

  // TODO input validation (zod?) - no special characters for name, last names

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-8">
      <h1 className="">{t("title")}</h1>
      <Form
        className="flex w-full gap-8"
        validationBehavior="native"
        // onSubmit={onSubmit}
      >
        <Input
          isRequired
          errorMessage={t("name.error")}
          min="2"
          label={t("name.label")}
          labelPlacement="outside"
          name="name"
          placeholder={t("name.placeholder")}
          type="text"
        />
        <Input
          isRequired
          errorMessage={t("lastName.error")}
          min="2"
          label={t("lastName.label")}
          labelPlacement="outside"
          name="lastName"
          placeholder={t("lastName.placeholder")}
          type="text"
        />
        <Select
          className="max-w-xs"
          items={races}
          label={t("race.label")}
          placeholder={t("race.placeholder")}
        >
          {(race) => <SelectItem key={race.name}>{race.name}</SelectItem>}
        </Select>
        <Button type="submit" color="primary" className="self-center">
          {t("submit")}
        </Button>
      </Form>
    </div>
  );
}
