"use client";

import { addToast, Button } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useGame } from "@/contexts/GameContext";
import { updateUserSettings } from "@/server/actions/userSettings";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { Tooltip } from "@heroui/tooltip";

export function UserSettings() {
  const t = useTranslations();
  const { userSettings, refreshUserSettings } = useGame();

  const updateSetting = async (key: string, value: string) => {
    try {
      await updateUserSettings({
        ...userSettings,
        [key]: value,
      });
      refreshUserSettings();
    } catch (error) {
      addToast({
        title: t("error"),
        description: "Error", // TODO add translations
        color: "danger",
      });
    }
  };

  const toggleDirection = () => {
    const newDirection =
      userSettings.chatDirection === "standard" ? "reverse" : "standard";
    updateSetting("chatDirection", newDirection);
  };

  return (
    <div className="m-4">
      <ul className="flex w-full flex-col gap-2">
        <li className="flex items-center gap-4">
          <span className="text-md text-default-600">Chat Direction</span>
          <Tooltip
            content={
              userSettings.chatDirection === "standard" ? "Standard" : "Reverse"
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
