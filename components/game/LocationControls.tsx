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
import { postActionMessage } from "@/server/actions/locationMessages";

// TODO trigger re-fetch when submitting a message (maybe pass a state setter from parent component

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

  useEffect(() => {
    const savedMessage = localStorage.getItem(
      "locationMessage-" + locationCode,
    );
    if (savedMessage) {
      setLocalMessage(savedMessage);
    }
  }, []);

  const handleMessageChange = (value: string) => {
    setLocalMessage(value);
    localStorage.setItem("locationMessage-" + locationCode, value);
  };

  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMessageType(e.target.value);
  };

  const handleTagChange = (value: string) => {
    setTag(value);
  };

  const handleSubmitMessage = async () => {
    if (!localMessage) return;
    try {
      if (messageType === "action") {
        await postActionMessage(
          locationId,
          currentCharacterId,
          localMessage,
          tag,
        );
      } else if (messageType === "whisper") {
        // post to make whisper to a specific character
        if (tag) {
        }
        // post to make whisper to all
        if (!tag) {
        }
      } else if (messageType === "master") {
        // post to master
      }

      // success!
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
          />
          <NavbarContent className="hidden gap-4 sm:flex sm:min-w-24 sm:flex-wrap">
            <NavbarItem>
              <Dices />
            </NavbarItem>
            <NavbarItem>
              <Save />
            </NavbarItem>
            <NavbarItem>
              <CircleHelp />
            </NavbarItem>
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
          value={tag}
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
