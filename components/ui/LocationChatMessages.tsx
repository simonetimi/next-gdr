import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { Avatar } from "@heroui/react";
import {
  enchanceCharacterName,
  enhanceTextWithSquareBrackets,
} from "@/utils/strings";
import { MinimalCharacter } from "@/models/characters";
import { Markup } from "interweave";
import { GameConfig } from "@/utils/config/gameConfig";

// TODO insert labels text to be translated

const locale = GameConfig.getLocale();

export function ActionMessage({
  currentMessage,
  character,
  onOpenCharacterSheet,
}: {
  currentMessage: LocationMessageWithCharacter;
  character: MinimalCharacter;
  onOpenCharacterSheet: (characterId: string) => void;
}) {
  const timeString = new Date(
    currentMessage.message.createdAt,
  ).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return (
    <div className="flex gap-3 py-1">
      <div className="flex flex-shrink-0 flex-col items-center gap-1">
        <Avatar
          onClick={() => onOpenCharacterSheet(character.id)}
          size="lg"
          src={currentMessage.character?.miniAvatarUrl ?? ""}
          name={currentMessage.character?.firstName ?? ""}
          className="cursor-pointer"
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
        <Markup
          content={enhanceTextWithSquareBrackets(
            enchanceCharacterName(
              currentMessage.message.content,
              character.firstName,
            ),
          )}
        />
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
      <div className="flex items-center gap-3 py-1">
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
      <div className="flex items-center gap-3 py-1">
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
    <div className="flex items-center gap-3 py-1">
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
      <div className="flex items-center gap-3 py-1">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic text-gray-600">Dici a tutti: </span>
          <span>{currentMessage.message.content}</span>
        </div>
      </div>
    );
  }

  // some user whispers to all
  return (
    <div className="flex items-center gap-3 py-1">
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
    <div className="flex flex-col gap-3 py-1">
      <div className="flex flex-col justify-center">
        <span className="text-center text-xs">{timeString}</span>
        <span className="text-center">Master screen</span>
      </div>
      <div className="w-full rounded-3xl border border-gray-200 p-2 text-justify dark:border-b-neutral-700">
        <span>{currentMessage.message.content}</span>
      </div>
    </div>
  );
}

export function SystemMessage({
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

  if (currentMessage.system?.systemType === "dice") {
    return (
      <div className="flex items-center gap-3 py-1">
        <span className="text-center text-xs">{timeString}</span>
        <div>
          <span className="font-semibold">
            {currentMessage.character?.firstName}
          </span>
          <span> {currentMessage.message.content}.</span>
        </div>
      </div>
    );
  }
}
