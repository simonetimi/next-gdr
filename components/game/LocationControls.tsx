"use client";

import {
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
import { CircleHelp, Dices, Save } from "lucide-react";

// TODO either fetch all users online in the cat and put it in the select
//  or check in the db

// TODO trigger re-fetch when submitting a message (maybe pass a state setter from parent component

export default function LocationControls({
  isUserMaster,
}: {
  isUserMaster: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [messageType, setMessageType] = useState<string>("action");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const savedMessage = localStorage.getItem("locationMessage");
    if (savedMessage) {
      setMessage(savedMessage);
    }
  }, []);

  const handleMessageChange = (value: string) => {
    setMessage(value);
    localStorage.setItem("locationMessage", value);
  };

  const handleSelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMessageType(e.target.value);
    console.log(e.target.value);
  };

  return (
    <div className="flex flex-[1] items-center gap-2 border border-black px-2 sm:gap-4 sm:px-4">
      <div className="w-10 sm:w-28">
        <Navbar
          isBlurred={false}
          isMenuOpen={isMenuOpen}
          onMenuOpenChange={setIsMenuOpen}
        >
          <NavbarContent className="sm:hidden">
            <NavbarMenuToggle
              className="-ml-2 h-6 w-6"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            />
          </NavbarContent>
          <NavbarContent className="hidden gap-4 sm:flex sm:flex-wrap">
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
        <Input label={messageType === "whisper" ? "Destinatario" : "Tag"} />
      </div>
      <div className="flex flex-1 items-start">
        <Textarea
          isClearable
          fullWidth={true}
          minRows={5}
          maxRows={7}
          value={message}
          onValueChange={handleMessageChange}
          placeholder="Scrivi il tuo testo qui"
        />
      </div>
    </div>
  );
}
