"use client";

import { Spinner, ScrollShadow } from "@heroui/react";
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
import { useLocationMessages } from "@/hooks/useLocationMessages";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "@uidotdev/usehooks";
import { createPortal } from "react-dom";
import Movable from "@/components/ui/Movable";
import CharacterSheet from "@/components/game/CharacterSheet";
import dynamic from "next/dynamic";

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

function LocationChat({
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

  // character sheets movable management
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const isMaxWidth850 = useMediaQuery("only screen and (max-width : 850px)");
  useEffect(() => {
    setIsSmallDevice(isMaxWidth850);
  }, [isMaxWidth850]);

  // manage multiple character sheets (unique for character, with a set)
  const [openCharacterSheets, setOpenCharacterSheets] = useState<Set<string>>(
    new Set(),
  );
  const toggleCharacterSheet = (characterId: string) => {
    setOpenCharacterSheets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(characterId)) {
        newSet.delete(characterId);
      } else {
        newSet.add(characterId);
      }
      return newSet;
    });
  };

  const portalRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    let portal = document.getElementById("portal-root");
    if (!portal) {
      portal = document.createElement("div");
      portal.style.cssText = "width: 100%; height: 100%;";
      document.body.prepend(portal);
    }
    portalRef.current = portal as HTMLDivElement;
  }, []);

  return (
    <>
      {Array.from(openCharacterSheets).map(
        (characterId) =>
          portalRef.current &&
          createPortal(
            <Movable
              key={characterId}
              boundsSelector="body"
              dragHandleClassName="handle"
              component={<CharacterSheet characterId={characterId} />}
              coords={isSmallDevice ? [0, 140] : [0, 110]}
              width={isSmallDevice ? "100vw" : 1000}
              minWidth={isSmallDevice ? "100vw" : 800}
              minHeight={isSmallDevice ? "calc(99vh - 140px)" : 550}
              height={isSmallDevice ? "calc(99vh - 140px)" : 600}
              showSetter={(show) => {
                if (!show) {
                  setOpenCharacterSheets((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(characterId);
                    return newSet;
                  });
                }
              }}
              enableResizing={!isSmallDevice}
              enableMovement={!isSmallDevice}
              componentName="characterSheet"
            />,
            portalRef.current,
          ),
      )}
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
                    messageRender(chatMessage, character, toggleCharacterSheet),
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
          isSecretLocation={isSecretLocation}
        />
      </section>
    </>
  );
}

export default dynamic(() => Promise.resolve(LocationChat), {
  ssr: false,
});

// TODO movable component to render characters' sheets
