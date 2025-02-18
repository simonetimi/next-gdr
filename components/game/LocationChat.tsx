"use client";

import { fetchAllLocationMessagesWithCharacters } from "@/server/actions/locationMessages";
import useFetchInterval from "@/hooks/useFetchInterval";
import { Spinner, ScrollShadow, Avatar } from "@heroui/react";
import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { useEffect, useState } from "react";

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
            <div className="flex flex-col gap-2 p-5">
              {allMessages &&
                allMessages.map((chatMessage) => (
                  <ActionMessage
                    key={chatMessage.message.id}
                    currentMessage={chatMessage}
                  />
                ))}
            </div>
          </ScrollShadow>
        </div>
      )}
    </div>
  );
}

// TODO one component for every type of message. it will handle the logic internally (what to render depending
//  on the recipientId, senderId, if userIsmaster ("for example he will see 'susan whispers to marc")
//  make a diagram to handle all the cases

// TODO movable component to render characters' sheets

function ActionMessage({
  currentMessage,
}: {
  currentMessage: LocationMessageWithCharacter;
}) {
  const timeString = new Date(
    currentMessage.message.createdAt,
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return (
    <div className="flex gap-3 p-2">
      <div className="flex flex-shrink-0 flex-col items-center gap-1">
        <Avatar
          size="lg"
          src={currentMessage.character?.miniAvatarUrl ?? ""}
          name={currentMessage.character?.miniAvatarUrl ?? ""}
        />
        <span className="text-xs">{timeString}</span>
      </div>
      <div className="flex flex-col text-justify">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {`${currentMessage.character?.firstName} ${currentMessage.character?.lastName}`}
          </span>
          <span className="italic text-gray-600">
            {currentMessage.action?.tag}
          </span>
        </div>
        <span>{currentMessage.message.content}</span>
      </div>
    </div>
  );
}
