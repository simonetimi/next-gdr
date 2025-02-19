"use client";

import { fetchAllLocationMessagesWithCharacters } from "@/server/actions/locationMessages";
import useFetchInterval from "@/hooks/useFetchInterval";
import { Spinner, ScrollShadow } from "@heroui/react";
import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { useEffect, useState } from "react";
import {
  ActionMessage,
  MasterMessage,
  WhisperAllMessage,
  WhisperMessage,
} from "@/components/ui/LocationChatMessages";

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
}: {
  locationId: string;
  characterId: string;
}) {
  const [allMessages, setAllMessages] = useState<
    LocationMessageWithCharacter[]
  >([]);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState<Date | null>(
    null,
  );
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

  // periodic fetch of new messages using the hook
  const { data: newMessages, loading } = useFetchInterval(
    () =>
      lastMessageTimestamp
        ? fetchAllLocationMessagesWithCharacters(
            locationId,
            lastMessageTimestamp,
          )
        : Promise.resolve([]),
    fetchingInterval,
  );

  // update messages when new ones arrive
  useEffect(() => {
    console.log(newMessages);
    if (newMessages && newMessages.length > 0) {
      setAllMessages((prev) => [...newMessages, ...prev]);
      setLastMessageTimestamp(new Date(newMessages[0].message.createdAt));
    }
  }, [newMessages]);

  return (
    <div className="flex h-full flex-[3]">
      {loading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <div className="relative h-full w-full border border-black">
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
  );
}

// TODO movable component to render characters' sheets
