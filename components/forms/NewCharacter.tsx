"use client";

import { characterSelectSchema } from "@/db/schema/character";
import { Race } from "@/models/characters";
import { createCharacter } from "@/server/actions/game";
import { GAME_ROUTE } from "@/utils/routes";
import { Form } from "@heroui/form";
import { Button, Input, Link, Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { z } from "zod";

type Character = z.infer<typeof characterSelectSchema>;
export default function NewCharacterForm({ races }: { races: Race[] }) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [error, setError] = useState<string>("");
  const t = useTranslations("pages.newCharacter");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    try {
      const response = await createCharacter(formData);
      setCharacter(response);
      setError("null");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setCharacter(null);
    }
  };

  return (
    <section className="flex h-screen flex-col items-center justify-center gap-8">
      {character ? (
        <>
          <h2>Welcome</h2>
          <div>You just created your new character: {character.firstName}</div>
          <Button as={Link} color="primary" href={GAME_ROUTE} variant="solid">
            {t("play")}
          </Button>
        </>
      ) : (
        <>
          <h1 className="">{t("title")}</h1>
          <Form
            className="flex w-full gap-8"
            validationBehavior="native"
            onSubmit={handleSubmit}
          >
            <Input
              isRequired
              errorMessage={t("name.error")}
              min="2"
              label={t("name.label")}
              labelPlacement="outside"
              name="firstName"
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
              isRequired
              items={races}
              label={t("race.label")}
              placeholder={t("race.placeholder")}
              name="race"
            >
              {(race) => (
                <SelectItem key={race.id} textValue={race.name}>
                  {race.name}
                </SelectItem>
              )}
            </Select>
            <Button type="submit" color="primary" className="self-center">
              {t("submit")}
            </Button>
          </Form>
        </>
      )}
    </section>
  );
}
