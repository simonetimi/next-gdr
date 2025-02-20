"use client";

import { useEffect, useRef, useState } from "react";
import { fetchAllLocationMessagesWithCharacters } from "@/server/actions/locationMessages";
import useFetchInterval from "@/hooks/useFetchInterval";
import { Spinner, ScrollShadow } from "@heroui/react";
import { LocationMessageWithCharacter } from "@/models/locationMessage";
import {
  ActionMessage,
  MasterMessage,
  WhisperAllMessage,
  WhisperMessage,
} from "@/components/ui/LocationChatMessages";
import LocationControls from "@/components/game/LocationControls";

function messageRender(
  currentMessage: LocationMessageWithCharacter,
  currentUserCharacterId: string,
) {
  const type = currentMessage.message.type;
  switch (type) {
    case "action":
      return (
        <ActionMessage
          currentMessage={currentMessage}
          key={currentMessage.message.id}
        />
      );
    case "whisper":
      return (
        <WhisperMessage
          currentMessage={currentMessage}
          currentUserCharacterId={currentUserCharacterId}
          key={currentMessage.message.id}
        />
      );
    case "whisperAll":
      return (
        <WhisperAllMessage
          currentMessage={currentMessage}
          currentUserCharacterId={currentUserCharacterId}
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
      return "TO IMPLEMENT";
  }
}

export default function LocationChat({
  locationId,
  characterId,
  isUserMaster,
  locationCode,
}: {
  locationId: string;
  characterId: string;
  isUserMaster: boolean;
  locationCode: string;
}) {
  const [allMessages, setAllMessages] = useState<
    LocationMessageWithCharacter[]
  >([]);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(
    null,
  );

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
      const initialMessages =
        await fetchAllLocationMessagesWithCharacters(locationId);
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
    try {
      const newMessages = await fetchAllLocationMessagesWithCharacters(
        locationId,
        lastMessageTimestamp,
      );
      if (newMessages.length > 0) {
        setAllMessages((prev) => [...newMessages, ...prev]);
        setLastMessageTimestamp(new Date(newMessages[0].message.createdAt));
      }
    } finally {
      setIsFetching(false);
    }
  };

  // periodic fetch of new messages using the hook
  const { data: newMessages, loading } = useFetchInterval(
    () =>
      lastMessageTimestamp && !isFetching
        ? fetchAllLocationMessagesWithCharacters(
            locationId,
            lastMessageTimestamp,
          )
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
          <div className="relative h-full w-full">
            <ScrollShadow className="absolute inset-0 overflow-y-auto">
              <div className="flex flex-col gap-2 p-5 text-sm">
                {allMessages &&
                  allMessages.map((chatMessage) =>
                    messageRender(chatMessage, characterId),
                  )}
              </div>
            </ScrollShadow>
          </div>
        )}
      </div>
      <LocationControls
        locationId={locationId}
        isUserMaster={isUserMaster}
        currentCharacterId={characterId}
        fetchMessages={fetchAndAppendMessages}
        locationCode={locationCode}
      />
    </section>
  );
}

// TODO movable component to render characters' sheets
