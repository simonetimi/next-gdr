"use client";

import { Spinner, ScrollShadow } from "@heroui/react";
import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { useGame } from "@/contexts/GameContext";
import {
  ActionMessage,
  MasterMessage,
  SystemMessage,
  WhisperAllMessage,
  WhisperMessage,
} from "@/components/ui/LocationChatMessages";
import LocationControls from "@/components/game/LocationControls";
import { MinimalCharacter } from "@/models/characters";
import { useLocationMessages } from "@/hooks/swr/useLocationMessages";
import { useLayoutEffect, useRef } from "react";

function messageRender(
  currentMessage: LocationMessageWithCharacter,
  character: MinimalCharacter,
  toggleCharacterSheet?: (characterId: string) => void,
) {
  const type = currentMessage.message.type;
  switch (type) {
    case "action":
      return (
        <ActionMessage
          currentMessage={currentMessage}
          character={character}
          key={currentMessage.message.id}
          onOpenCharacterSheet={toggleCharacterSheet || (() => {})}
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
          character={character}
          key={currentMessage.message.id}
        />
      );
    case "master":
      return (
        <MasterMessage
          currentMessage={currentMessage}
          character={character}
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
  isSecretLocation,
}: {
  locationId: string;
  character: MinimalCharacter;
  isUserMaster: boolean;
  locationCode: string;
  isSecretLocation?: boolean;
}) {
  const { messages, mutate, isRefetching, initialLoading } =
    useLocationMessages(locationId, isSecretLocation);

  // the character sheet state is controlled in the context, as well as userSettings for chat direction
  const game = useGame();

  // scroll into view (reversed order for messages)
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (game.userSettings.chatDirection === "reverse") {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, game]);

  return (
    <section className="align-center flex w-screen flex-col justify-center rounded-2xl shadow-xl dark:shadow dark:shadow-default-200 lg:w-[80vw]">
      <div className="flex h-full flex-[3]">
        {initialLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="relative h-full w-full" id="chat-messages">
            <ScrollShadow
              className="absolute inset-0 overflow-y-auto"
              offset={10}
            >
              <div
                className={`flex ${game.userSettings.chatDirection === "reverse" ? "flex-col-reverse" : "flex-col"} p-5 text-sm`}
              >
                {messages?.map((chatMessage) =>
                  messageRender(
                    chatMessage,
                    character,
                    game.toggleCharacterSheet,
                  ),
                )}
              </div>
              <div ref={bottomRef} />
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
        isSecretLocation={isSecretLocation}
      />
    </section>
  );
}
