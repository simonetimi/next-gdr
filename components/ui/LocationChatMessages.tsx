import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { Avatar } from "@heroui/react";

// TODO insert labels text to be translated

const locale = process.env.LOCALE;

export function ActionMessage({
  currentMessage,
}: {
  currentMessage: LocationMessageWithCharacter;
}) {
  const timeString = new Date(
    currentMessage.message.createdAt,
  ).toLocaleTimeString(locale, {
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

export function WhisperMessage({
  currentMessage,
  currentUserCharacterId,
}: {
  currentMessage: LocationMessageWithCharacter;
  currentUserCharacterId: string;
}) {
  const timeString = new Date(
    currentMessage.message.createdAt,
  ).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // executes when the current user is the recipient of the whisper
  if (currentMessage.whisper?.recipientCharacterId === currentUserCharacterId) {
    return (
      <div className="flex gap-3 p-2">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="font-semibold">
            ${currentMessage.character?.firstName}
          </span>
          <span className="italic text-gray-600"> ti dice: </span>
          <span>{currentMessage.message.content}</span>
        </div>
      </div>
    );
  }

  // exectues when the current user is the sender of the whisper
  if (
    currentMessage.whisper?.recipientCharacterId !== currentUserCharacterId &&
    currentMessage.character?.id === currentUserCharacterId
  ) {
    return (
      <div className="flex gap-3 p-2">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic text-gray-600">Dici a </span>
          <span className="font-semibold">
            ${currentMessage.character?.firstName}
          </span>
          <span className="italic text-gray-600">: </span>
          <span>{currentMessage.message.content}</span>
        </div>
      </div>
    );
  }

  // executes when the user is the master (they can see all whispers - so their id isn't there)
  return (
    <div className="flex gap-3 p-2">
      <span className="text-xs">{timeString}</span>
      <div className="text-justify">
        <span className="font-semibold">
          ${currentMessage.character?.firstName}
        </span>
        <span className="italic text-gray-600">dice a </span>
        <span className="font-semibold">
          ${currentMessage.character?.firstName}
        </span>
        <span className="italic text-gray-600">: </span>
        <span>{currentMessage.message.content}</span>
      </div>
    </div>
  );
}

export function WhisperAllMessage({
  currentMessage,
  currentUserCharacterId,
}: {
  currentMessage: LocationMessageWithCharacter;
  currentUserCharacterId: string;
}) {
  const timeString = new Date(
    currentMessage.message.createdAt,
  ).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // current user whispers to all
  if (currentMessage.character?.id === currentUserCharacterId) {
    return (
      <div className="flex gap-3 p-2">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic text-gray-600">Dici a tutti: </span>
          <span className="italic text-gray-600">: </span>
          <span>{currentMessage.message.content}</span>
        </div>
      </div>
    );
  }

  // some user whispers to all
  return (
    <div className="flex gap-3 p-2">
      <span className="text-xs">{timeString}</span>
      <div className="text-justify">
        <span className="font-semibold">
          ${currentMessage.character?.firstName}
        </span>
        <span className="italic text-gray-600">dice a tutti: </span>
        <span>{currentMessage.message.content}</span>
      </div>
    </div>
  );
}

export function MasterMessage({
  currentMessage,
}: {
  currentMessage: LocationMessageWithCharacter;
}) {
  const timeString = new Date(
    currentMessage.message.createdAt,
  ).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return (
    <div className="flex flex-col gap-3 p-2">
      <span className="text-center text-xs">{timeString}</span>
      <div className="text-justify">
        <span>{currentMessage.message.content}</span>
      </div>
    </div>
  );
}

// TODO system message (with the ability to get additionalData, maybe an accordion or a big tooltip)
