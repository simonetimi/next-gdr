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

export default function LocationControls({
  locationId,
  isUserMaster,
  currentCharacterId,
  fetchMessages,
  locationCode,
}: {
  locationId: string;
  isUserMaster: boolean;
  currentCharacterId: string;
  fetchMessages: () => void;
  locationCode: string;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    if (!localMessage) return;
    try {
      if (messageType === "action") {
        if (localMessage.startsWith("#")) {
          const dice = parseInt(localMessage.trim().slice(1));
          if (Number.isNaN(dice)) throw new Error("Invalid dice roll");
          await rollDice(dice, locationId, currentCharacterId);
        } else {
          await postActionMessage(
            locationId,
            currentCharacterId,
            localMessage,
            tag,
          );
        }
      } else if (messageType === "whisper") {
        if (recipientCharacter) {
          await postWhisper(
            locationId,
            currentCharacterId,
            recipientCharacter,
            localMessage,
          );
        } else {
          await postWhisperForAll(locationId, currentCharacterId, localMessage);
        }
      } else if (messageType === "master") {
        await postMasterScreen(locationId, currentCharacterId, localMessage);
      }

      // empty the fields and remove from locale storage
      setLocalMessage("");
      setTag("");
      localStorage.removeItem("locationMessage-" + locationCode);

      // refresh chat
      fetchMessages();
    } catch (error) {
      //handle error (toast)
    }
  };
  return (
    <div className="flex flex-[1] items-center gap-2 px-2 sm:gap-4 sm:px-4">
      <div className="w-10 sm:w-28">
        <Navbar
          isBlurred={false}
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
        >
          <NavbarMenuToggle
            className="-ml-2 h-6 w-6 sm:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          ></NavbarMenuToggle>
          <NavbarContent className="hidden gap-3 pr-5 sm:flex sm:min-w-24 sm:flex-col sm:items-center">
            <div className="hidden gap-4 sm:flex sm:flex-wrap sm:justify-center">
              <NavbarItem>
                <Dices />
              </NavbarItem>
              <NavbarItem>
                <Save />
              </NavbarItem>
              <NavbarItem>
                <CircleHelp />
              </NavbarItem>
            </div>
            <span className="text-center">{messageCharCount}</span>
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
          placeholder="Scrivi il tuo testo qui"
        />
        <Button
          isIconOnly
          startContent={<Send />}
          variant="light"
          onPress={handleSubmitMessage}
        />
      </div>
    </div>
  );
}
