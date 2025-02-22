"use client";

import { useEffect, useRef, useState } from "react";
import useSWRInfinite from "swr/infinite";
import useFetchInterval from "@/hooks/useFetchInterval";
import { Spinner, ScrollShadow, addToast } from "@heroui/react";
import { LocationMessageWithCharacter } from "@/models/locationMessage";
import {
  ActionMessage,
  MasterMessage,
  SystemMessage,
  WhisperAllMessage,
  WhisperMessage,
} from "@/components/ui/LocationChatMessages";
import LocationControls from "@/components/game/LocationControls";
import { MinimalCharacter } from "@/models/characters";
import { useTranslations } from "next-intl";
import { fetcher } from "@/utils/swr";
import useSWR from "swr";
import { useLocationMessages } from "@/hooks/useLocationMessages";

function messageRender(
  currentMessage: LocationMessageWithCharacter,
  character: MinimalCharacter,
) {
  const type = currentMessage.message.type;
  switch (type) {
    case "action":
      return (
        <ActionMessage
          currentMessage={currentMessage}
          character={character}
          key={currentMessage.message.id}
        />
      );
    case "whisper":
      return (
        <WhisperMessage
          currentMessage={currentMessage}
          currentUserCharacterId={character.id}
          key={currentMessage.message.id}
        />
      );
    case "whisperAll":
      return (
        <WhisperAllMessage
          currentMessage={currentMessage}
          currentUserCharacterId={character.id}
          key={currentMessage.message.id}
        />
      );
    case "master":
      return (
        <MasterMessage
          currentMessage={currentMessage}
          key={currentMessage.message.id}
        />
      );
    case "system":
      return (
        <SystemMessage
          currentMessage={currentMessage}
          key={currentMessage.message.id}
        />
      );
  }
}

export default function LocationChat({
  locationId,
  character,
  isUserMaster,
  locationCode,
}: {
  locationId: string;
  character: MinimalCharacter;
  isUserMaster: boolean;
  locationCode: string;
}) {
  const t = useTranslations();

  const { messages, mutate, isRefetching, initialLoading } =
    useLocationMessages(locationId);

  return (
    <section className="align-center flex w-full flex-col justify-center rounded-2xl shadow-xl dark:shadow dark:shadow-gray-700">
      <div className="flex h-full flex-[3]">
        {initialLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="relative h-full w-full" id="chat-messages">
            <ScrollShadow className="absolute inset-0 overflow-y-auto">
              <div className="flex flex-col p-5 text-sm">
                {messages?.map((chatMessage) =>
                  messageRender(chatMessage, character),
                )}
              </div>
            </ScrollShadow>
          </div>
        )}
      </div>
      <LocationControls
        locationId={locationId}
        isUserMaster={isUserMaster}
        currentCharacterId={character.id}
        fetchMessages={mutate}
        isRefetching={isRefetching}
        locationCode={locationCode}
      />
    </section>
  );
}

// TODO movable component to render characters' sheets
