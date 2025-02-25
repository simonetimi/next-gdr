import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { Avatar } from "@heroui/react";
import { MinimalCharacter } from "@/models/characters";
import { GameConfig } from "@/utils/config/GameConfig";
import { replaceAngleBrackets } from "@/utils/strings";
import { Interweave } from "interweave";
import { generateMatchers } from "@/utils/interweaveMatchers";

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

  // replace single angle brackets with guillemet
  const contentWithoutAngleBrackets = replaceAngleBrackets(
    currentMessage.message.content,
  );

  const { guillemetMatcher, squareBracketsMatcher, wordmatcher } =
    generateMatchers(character.firstName);

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
      <div className="text-red flex flex-col text-justify">
        <div className="flex items-center gap-2">
          <span className="font-semibold">
            {`${currentMessage.character?.firstName} ${currentMessage.character?.lastName}`}
          </span>
          <span className="text-xs italic text-neutral-600 dark:text-neutral-500">
            {currentMessage.action?.tag}
          </span>
        </div>
        <Interweave
          disableLineBreaks
          noHtmlExceptMatchers
          className="text-neutral-700 dark:text-neutral-400"
          matchers={[guillemetMatcher, squareBracketsMatcher, wordmatcher]}
          content={contentWithoutAngleBrackets}
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
      <div className="flex items-center gap-2 py-1">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="font-semibold">
            {currentMessage.character?.firstName}
          </span>
          <span className="italic text-neutral-600 dark:text-neutral-500">
            {" "}
            ti dice:{" "}
          </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {currentMessage.message.content}
          </span>
        </div>
      </div>
    );
  }

  // execute when the current user is the sender of the whisper
  if (
    currentMessage.whisper?.recipientCharacterId !== currentUserCharacterId &&
    currentMessage.character?.id === currentUserCharacterId
  ) {
    return (
      <div className="flex items-center gap-2 py-1">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic text-neutral-600 dark:text-neutral-500">
            Dici a{" "}
          </span>
          <span className="font-semibold">
            ${currentMessage.character?.firstName}
          </span>
          <span className="italic text-neutral-600 dark:text-neutral-500">
            :{" "}
          </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {currentMessage.message.content}
          </span>
        </div>
      </div>
    );
  }

  // execute when the user is the master (they can see all whispers - so their id isn't there)
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs">{timeString}</span>
      <div className="text-justify">
        <span className="font-semibold">
          ${currentMessage.character?.firstName}
        </span>
        <span className="italic text-neutral-600 dark:text-neutral-500">
          dice a{" "}
        </span>
        <span className="font-semibold">
          ${currentMessage.character?.firstName}
        </span>
        <span className="italic text-neutral-600 dark:text-neutral-500">
          :{" "}
        </span>
        <span className="text-neutral-700 dark:text-neutral-300">
          {currentMessage.message.content}
        </span>
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
      <div className="flex items-center gap-2 py-1">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic text-neutral-600 dark:text-neutral-500">
            Dici a tutti:{" "}
          </span>
          <span className="text-neutral-700 dark:text-neutral-300">
            {currentMessage.message.content}
          </span>
        </div>
      </div>
    );
  }

  // some user whispers to all
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs">{timeString}</span>
      <div className="text-justify">
        <span className="font-semibold">
          ${currentMessage.character?.firstName}
        </span>
        <span className="italic text-neutral-600 dark:text-neutral-500">
          dice a tutti:{" "}
        </span>
        <span className="text-neutral-700 dark:text-neutral-300">
          {currentMessage.message.content}
        </span>
      </div>
    </div>
  );
}

export function MasterMessage({
  currentMessage,
  character,
}: {
  currentMessage: LocationMessageWithCharacter;
  character: MinimalCharacter;
}) {
  const timeString = new Date(
    currentMessage.message.createdAt,
  ).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const contentWithoutAngleBrackets = replaceAngleBrackets(
    currentMessage.message.content,
  );
  const { guillemetMatcher, squareBracketsMatcher, wordmatcher } =
    generateMatchers(character.firstName);

  return (
    <div className="flex flex-col gap-3 py-1">
      <div className="flex flex-col justify-center">
        <span className="text-center text-xs">{timeString}</span>
        <span className="text-center">Master screen</span>
      </div>
      <div className="w-full rounded-xl border border-gray-200 p-2 text-justify dark:border-neutral-800">
        <Interweave
          disableLineBreaks
          noHtmlExceptMatchers
          className="text-neutral-700 dark:text-neutral-400"
          matchers={[guillemetMatcher, squareBracketsMatcher, wordmatcher]}
          content={contentWithoutAngleBrackets}
        />
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
