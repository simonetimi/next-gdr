"use client";

import { addToast, Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useGame } from "@/contexts/GameContext";
import { updateUserSettings } from "@/server/actions/userSettings";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

export function UserSettings() {
  const t = useTranslations("");
  const { userSettings, refreshUserSettings } = useGame();

  const updateSetting = async (key: string, value: string) => {
    try {
      await updateUserSettings({
        ...userSettings,
        [key]: value,
      });
      refreshUserSettings();
    } catch (error) {
      let errorMessage = t("errors.generic");
      if (error instanceof Error) errorMessage = error.message;
      addToast({
        title: t("errors.title"),
        description: errorMessage,
        color: "danger",
      });
    }
  };

  const toggleDirection = async () => {
    const newDirection =
      userSettings.chatDirection === "standard" ? "reverse" : "standard";
    await updateSetting("chatDirection", newDirection);
  };

  return (
    <div className="m-4">
      <ul className="flex w-full flex-col gap-2">
        <li className="flex items-center gap-4">
          <span className="text-md text-default-600">
            {t("components.settings.chatDirection.title")}
          </span>
          <Tooltip
            content={
              userSettings.chatDirection === "standard"
                ? t("components.settings.chatDirection.standard")
                : t("components.settings.chatDirection.reverse")
            }
          >
            <Button
              isIconOnly
              size="sm"
              color="primary"
              onPress={toggleDirection}
              startContent={
                userSettings.chatDirection === "standard" ? (
                  <ChevronsUp />
                ) : (
                  <ChevronsDown />
                )
              }
            />
          </Tooltip>
        </li>
      </ul>
    </div>
  );
}
