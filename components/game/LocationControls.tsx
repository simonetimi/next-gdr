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
} from "@/server/actions/locationMessages";
import { rollDice } from "@/server/actions/game";
import { downloadComponent } from "@/utils/download";
import { useTranslations } from "next-intl";

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
  const locale = process.env.LOCALE;
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

  const handleMessageChange = (value: string) => {
    const truncatedValue = value.length >= 4000 ? value.slice(0, 4000) : value;
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
              title: t("errors.chat.invalidRoll"),
              description: t("errors.chat.invalidRollDescription"),
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

      // empty the fields and remove from locale storage
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
        color: "danger",
      });
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, COOLDOWN_TIME);
    }
  };

  function onDownloadChat() {
    downloadComponent(locale ?? "en-US", locationCode);
  }

  return (
    <div className="z-10 flex flex-[1] items-center gap-2 px-2 sm:gap-4 sm:pr-3">
      <div className="w-10 sm:w-28">
        <Navbar
          isBlurred={false}
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
          classNames={{ wrapper: "ml-4 p-2 items-self-center" }}
        >
          <NavbarMenuToggle
            className="-ml-3 sm:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          ></NavbarMenuToggle>
          <NavbarContent className="hidden sm:flex sm:h-full sm:w-full sm:flex-col sm:gap-2">
            <div className="-mt-4 flex flex-wrap gap-x-1 gap-y-2">
              <NavbarItem>
                <Button
                  isIconOnly
                  size="sm"
                  className="m-0 p-0"
                  startContent={<Dices className="h-6 w-6" />}
                  variant="light"
                />
              </NavbarItem>
              <NavbarItem>
                <Button
                  isIconOnly
                  size="sm"
                  className="m-0 p-0"
                  startContent={<Save className="h-6 w-6" />}
                  onPress={onDownloadChat}
                  variant="light"
                />
              </NavbarItem>
              <NavbarItem>
                <Button
                  isIconOnly
                  size="sm"
                  className="m-0 p-0"
                  startContent={<CircleHelp className="h-6 w-6" />}
                  variant="light"
                />
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
      <div className="align-items flex w-24 flex-col gap-2 sm:w-36">
        <Select
          onChange={handleSelectionChange}
          selectedKeys={[messageType]}
          label="Tipo"
          variant="flat"
        >
          <SelectItem key="action">Azione</SelectItem>
          <SelectItem key="whisper">Sussurro</SelectItem>
          {isUserMaster ? <SelectItem key="master">Master</SelectItem> : null}
        </Select>
        <Input
          onValueChange={handleTagChange}
          value={messageType === "whisper" ? recipientCharacter : tag}
          label={messageType === "whisper" ? "Destinatario" : "Tag"}
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
          placeholder="Scrivi il tuo testo qui"
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
