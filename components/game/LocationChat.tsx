"use client";

import { useEffect, useRef, useState } from "react";
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
  const [allMessages, setAllMessages] = useState<
    LocationMessageWithCharacter[]
  >([]);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(
    null,
  );
  const t = useTranslations();

  // keeps the state of the fetching and a reference for the hook
  const [isFetching, setIsFetching] = useState(false);
  const isFetchingRef = useRef(isFetching);
  useEffect(() => {
    isFetchingRef.current = isFetching;
  }, [isFetching]);

  const fetchingInterval = 30 * 1000; // 30 seconds

  // initial fetch of all messages
  useEffect(() => {
    const fetchInitialMessages = async () => {
      const response = await fetch(
        `/api/game/location-messages/${locationId}?timestamp=`,
      );
      if (!response.ok) {
        const errorMessage = (await response.json()).error;
        return addToast({
          title: t("errors.title"),
          description: errorMessage || t("errors.generic"),
          color: "danger",
        });
      }
      const initialMessages = await response.json();

      setAllMessages(initialMessages);
      // set the timestamp of the newest message
      if (initialMessages.length > 0) {
        setLastMessageTimestamp(new Date(initialMessages[0].message.createdAt));
      }
    };
    fetchInitialMessages();
  }, [locationId]);

  // manual fetch
  const fetchAndAppendMessages = async () => {
    if (isFetching) return; // prevent multiple fetches
    setIsFetching(true);
    let timestamp = "";
    if (lastMessageTimestamp) timestamp = lastMessageTimestamp.toISOString();
    const response = await fetch(
      `/api/game/location-messages/${locationId}?timestamp=${timestamp}`,
    );
    if (!response.ok) {
      const errorMessage = (await response.json()).error;
      setIsFetching(false);
      return addToast({
        title: t("errors.title"),
        description: errorMessage || t("errors.generic"),
        color: "danger",
      });
    }
    const newMessages = await response.json();
    if (newMessages.length > 0) {
      setAllMessages((prev) => [...newMessages, ...prev]);
      setLastMessageTimestamp(new Date(newMessages[0].message.createdAt));
    }
    setIsFetching(false);
  };

  // periodic fetch of new messages using the hook
  const { data: newMessages, loading } = useFetchInterval(
    async () =>
      lastMessageTimestamp && !isFetching
        ? fetch(
            `/api/game/location-messages/${locationId}?timestamp=${lastMessageTimestamp.toISOString()}`,
          ).then(async (response) => {
            if (!response.ok) {
              const errorMessage = (await response.json()).error;
              return addToast({
                title: t("errors.title"),
                description: errorMessage || t("errors.generic"),
                color: "danger",
              });
            }
            return response.json();
          })
        : Promise.resolve([]),
    fetchingInterval,
    isFetchingRef,
    setIsFetching,
  );

  // update messages when new ones arrive
  useEffect(() => {
    if (newMessages && newMessages.length > 0) {
      setAllMessages((prev) => [...newMessages, ...prev]);
      setLastMessageTimestamp(new Date(newMessages[0].message.createdAt));
    }
  }, [newMessages]);

  return (
    <section className="align-center flex w-full flex-col justify-center rounded-2xl shadow-xl dark:shadow dark:shadow-gray-700">
      <div className="flex h-full flex-[3]">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="relative h-full w-full" id="chat-messages">
            <ScrollShadow className="absolute inset-0 overflow-y-auto">
              <div className="flex flex-col p-5 text-sm">
                {allMessages &&
                  allMessages.map((chatMessage) =>
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
        fetchMessages={fetchAndAppendMessages}
        locationCode={locationCode}
      />
    </section>
  );
}

// TODO movable component to render characters' sheets
