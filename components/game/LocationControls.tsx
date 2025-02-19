"use client";

import { Input, Select, SelectItem, Textarea } from "@heroui/react";
import { ChangeEvent, useEffect, useState } from "react";

// TODO either fetch all users online in the cat and put it in the select
//  or check in the db

// TODO trigger re-fetch when submitting a message (maybe pass a state setter from parent component

export default function LocationControls({
  isUserMaster,
}: {
  isUserMaster: boolean;
}) {
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
    <div className="flex flex-[1] items-center gap-4 border border-black px-4">
      <div className="w-36">Pulsantini</div>
      <div className="align-items flex w-36 flex-col gap-2">
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
          value={message}
          onValueChange={handleMessageChange}
          placeholder="Scrivi il tuo testo qui"
        />
      </div>
    </div>
  );
}
