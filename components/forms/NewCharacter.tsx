"use client";

import { Character } from "@/models/characters";
import { Races } from "@/models/races";
import { createCharacter } from "@/server/actions/character";
import { GAME_ROUTE } from "@/utils/routes";
import { Form } from "@heroui/form";
import { Button, Input, Link, Select, SelectItem } from "@heroui/react";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

export default function NewCharacterForm({ races }: { races: Races }) {
  const [character, setCharacter] = useState<Character | null>(null);
  // TODO state for error not needed if it's handles with toast
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("pages.newCharacter");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    try {
      const response = await createCharacter(formData);
      setCharacter(response);
      setError("null");
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      setCharacter(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="flex flex-col items-center justify-center gap-8">
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
              isDisabled={isLoading}
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
              isDisabled={isLoading}
            />
            <Select
              className="max-w-xs"
              isRequired
              items={races}
              label={t("race.label")}
              placeholder={t("race.placeholder")}
              name="race"
              isDisabled={isLoading}
            >
              {(race) => (
                <SelectItem key={race.id} textValue={race.name}>
                  {race.name}
                </SelectItem>
              )}
            </Select>
            <Button
              type="submit"
              color="primary"
              className="self-center"
              isLoading={isLoading}
            >
              {t("submit")}
            </Button>
          </Form>
        </>
      )}
    </section>
  );
}
