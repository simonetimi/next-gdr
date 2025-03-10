"use client";

import {
  Button,
  Input,
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Select,
  SelectItem,
  Textarea,
  addToast,
  Spinner,
} from "@heroui/react";
import { ChangeEvent, useEffect, useState } from "react";
import { CircleHelp, Dices, Save, Send } from "lucide-react";
import {
  postActionMessage,
  postMasterScreen,
  postWhisper,
  postWhisperForAll,
  saveLocationChat,
} from "@/server/actions/locationMessage";
import { rollDice } from "@/server/actions/game";
import { generateLocationChatHTML } from "@/utils/download";
import { useTranslations } from "next-intl";
import { Tooltip } from "@heroui/tooltip";
import { GameConfig } from "@/utils/config/GameConfig";

export default function LocationControls({
  locationId,
  isUserMaster,
  currentCharacterId,
  fetchMessages,
  isRefetching,
  locationCode,
  isSecretLocation,
}: {
  locationId: string;
  isUserMaster: boolean;
  currentCharacterId: string;
  fetchMessages: () => void;
  isRefetching: boolean;
  locationCode: string;
  isSecretLocation?: boolean;
}) {
  const t = useTranslations();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const COOLDOWN_TIME = 3000; // 3 sec

  const [messageType, setMessageType] = useState<string>("action");
  const [localMessage, setLocalMessage] = useState<string>("");
  const [tag, setTag] = useState<string>("");
  const [recipientCharacter, setRecipientCharacter] = useState<string>("");
  const [messageCharCount, setMessageCharCount] = useState<number>(0);

  // tag and recipientCharacter change depending on the select state
  // tag is saved in the local storage, along with localMessage

  useEffect(() => {
    const savedMessage = localStorage.getItem(
      "locationMessage-" + locationCode,
    );
    if (savedMessage) {
      setLocalMessage(savedMessage);
      setMessageCharCount(savedMessage.length);
    }
    const savedTag = localStorage.getItem("locationTag-" + locationCode);
    if (savedTag) {
      setTag(savedTag);
    }
  }, [locationCode]);

  const maxChars = GameConfig.getCharsLimitsPerAction().max;
  const handleMessageChange = (value: string) => {
    const truncatedValue =
      value.length >= maxChars ? value.slice(0, maxChars) : value;
    setLocalMessage(truncatedValue);
    setMessageCharCount(truncatedValue.length);
    localStorage.setItem("locationMessage-" + locationCode, truncatedValue);
  };

  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMessageType(e.target.value);
  };

  const handleTagChange = (value: string) => {
    if (messageType === "whisper") {
      const truncatedValue = value.length > 50 ? value.slice(0, 50) : value;
      setRecipientCharacter(truncatedValue);
    } else {
      const truncatedValue = value.length > 30 ? value.slice(0, 30) : value;
      setTag(truncatedValue);
      localStorage.setItem("locationTag-" + locationCode, truncatedValue);
    }
  };

  const handleSubmitMessage = async () => {
    if (!localMessage || isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (messageType === "action") {
        if (localMessage.startsWith("#d")) {
          const dice = parseInt(localMessage.trim().slice(2));
          if (Number.isNaN(dice)) {
            addToast({
              title: t("errors.locationChat.invalidRoll"),
              description: t("errors.locationChat.invalidRollDescription"),
              color: "warning",
            });
            return;
          }
          await rollDice(dice, locationId, currentCharacterId);
        } else {
          await postActionMessage(
            locationId,
            currentCharacterId,
            localMessage,
            tag,
            isSecretLocation,
          );
        }
      } else if (messageType === "whisper") {
        if (recipientCharacter) {
          await postWhisper(
            locationId,
            currentCharacterId,
            recipientCharacter,
            localMessage,
            isSecretLocation,
          );
        } else {
          await postWhisperForAll(
            locationId,
            currentCharacterId,
            localMessage,
            isSecretLocation,
          );
        }
      } else if (messageType === "master") {
        await postMasterScreen(
          locationId,
          currentCharacterId,
          localMessage,
          isSecretLocation,
        );
      }

      // empty the fields and remove from local storage
      setLocalMessage("");
      setMessageCharCount(0);
      localStorage.removeItem("locationMessage-" + locationCode);

      // refresh chat
      fetchMessages();
    } catch (error) {
      let errorMessage = t("errors.generic");
      if (error instanceof Error) errorMessage = error.message;
      addToast({
        title: t("errors.title"),
        description: errorMessage,
        color: "warning",
      });
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, COOLDOWN_TIME);
    }
  };

  async function onDownloadChat() {
    const generatedHtml = generateLocationChatHTML(locationCode);
    const link = await saveLocationChat(generatedHtml);
    try {
      await navigator.clipboard.writeText(link);
      addToast({
        title: t("components.locationControls.chatSavedOnClipboard"),
        color: "success",
      });
    } catch (_error) {
      addToast({
        title: t("errors.title"),
        description: t("errors.locationChat.savingChat"),
        color: "danger",
      });
    }
  }

  return (
    <div className="z-10 flex flex-[1] items-center gap-2 px-2 lg:gap-4 lg:pr-3">
      <div className="w-10 lg:w-28">
        <Navbar
          isBlurred={false}
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
          classNames={{ wrapper: "ml-4 p-2 items-self-center" }}
        >
          <NavbarMenuToggle
            className="-ml-3 lg:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          ></NavbarMenuToggle>
          <NavbarContent className="hidden lg:flex lg:h-full lg:w-full lg:flex-col lg:gap-2">
            <div className="-mt-4 flex flex-wrap gap-x-1 gap-y-2">
              <NavbarItem>
                <Tooltip content={t("components.locationControls.rollDice")}>
                  <Button
                    isIconOnly
                    size="sm"
                    className="m-0 p-0"
                    startContent={<Dices className="h-6 w-6" />}
                    variant="light"
                  />
                </Tooltip>
              </NavbarItem>
              <NavbarItem>
                <Tooltip content={t("components.locationControls.saveChat")}>
                  <Button
                    isIconOnly
                    size="sm"
                    className="m-0 p-0"
                    startContent={<Save className="h-6 w-6" />}
                    onPress={onDownloadChat}
                    variant="light"
                  />
                </Tooltip>
              </NavbarItem>
              <NavbarItem>
                <Tooltip content={t("components.locationControls.help")}>
                  <Button
                    isIconOnly
                    size="sm"
                    className="m-0 p-0"
                    startContent={<CircleHelp className="h-6 w-6" />}
                    variant="light"
                  />
                </Tooltip>
              </NavbarItem>
            </div>
            <div className="-mt-5">
              {isRefetching && <Spinner size="sm" variant="wave" />}
            </div>
          </NavbarContent>
          <NavbarMenu>
            <NavbarMenuItem></NavbarMenuItem>
          </NavbarMenu>
        </Navbar>
      </div>
      <div className="align-items flex w-24 flex-col gap-2 lg:w-36">
        <Select
          onChange={handleSelectionChange}
          selectedKeys={[messageType]}
          label="Tipo"
          variant="flat"
        >
          <SelectItem key="action">
            {t("components.locationControls.action")}
          </SelectItem>
          <SelectItem key="whisper">
            {t("components.locationControls.whisper")}
          </SelectItem>
          {isUserMaster ? (
            <SelectItem key="master">
              {t("components.locationControls.master")}
            </SelectItem>
          ) : null}
        </Select>
        <Input
          onValueChange={handleTagChange}
          value={messageType === "whisper" ? recipientCharacter : tag}
          label={
            messageType === "whisper"
              ? t("components.locationControls.recipient")
              : t("components.locationControls.tag")
          }
        />
      </div>
      <div className="flex flex-1 items-center justify-end gap-1">
        <Textarea
          isClearable
          fullWidth={true}
          minRows={5}
          maxRows={7}
          value={localMessage}
          onValueChange={handleMessageChange}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              await handleSubmitMessage();
            }
          }}
          placeholder={t("components.locationControls.messagePlaceholder")}
        />
        <div className="flex flex-col gap-3 pl-2">
          <Button
            isIconOnly
            startContent={<Send />}
            variant="light"
            onPress={handleSubmitMessage}
            disabled={isSubmitting}
          />
          <span className="text-center text-sm">{messageCharCount}</span>
        </div>
      </div>
    </div>
  );
}

// TODO implement movables for: sidebar (only menu), dices, help (3)
