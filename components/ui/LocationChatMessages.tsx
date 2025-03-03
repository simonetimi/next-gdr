import { LocationMessageWithCharacter } from "@/models/locationMessage";
import { Avatar } from "@heroui/react";
import { MinimalCharacter } from "@/models/characters";
import { GameConfig } from "@/utils/config/GameConfig";
import { capitalize, replaceAngleBrackets } from "@/utils/strings";
import { Interweave } from "interweave";
import { generateMatchers } from "@/utils/interweaveMatchers";
import { formatTimeHoursMinutes } from "@/utils/dates";
import { useTranslations } from "next-intl";

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
  const createdAt = new Date(currentMessage.message.createdAt);
  const timeString = formatTimeHoursMinutes(createdAt, locale);

  // replace single angle brackets with guillemet
  const contentWithoutAngleBrackets = replaceAngleBrackets(
    currentMessage.message.content,
  );

  const { guillemetMatcher, squareBracketsMatcher, wordmatcher } =
    generateMatchers(character.firstName);

  return (
    <div className="flex gap-3 py-1 text-foreground-700 dark:text-foreground-600">
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
        <div className="flex items-center gap-1.5">
          <span className="font-semibold">
            {currentMessage.character?.firstName}{" "}
            {currentMessage.character?.lastName}
          </span>
          <span className="text-xs italic text-foreground-600 dark:text-foreground-500">
            {currentMessage.action?.tag}
          </span>
        </div>
        <Interweave
          disableLineBreaks
          noHtmlExceptMatchers
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
  const t = useTranslations("components.locationChat.messages");

  const createdAt = new Date(currentMessage.message.createdAt);
  const timeString = formatTimeHoursMinutes(createdAt, locale);

  // executes when the current user is the recipient of the whisper
  if (currentMessage.whisper?.recipientCharacterId === currentUserCharacterId) {
    return (
      <div className="flex items-center gap-2 py-1 text-foreground-700 dark:text-foreground-600">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic">
            {`${t("incomingWhisper", { character: currentMessage.character?.firstName })}: `}
          </span>
          <span>{currentMessage.message.content}</span>
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
      <div className="flex items-center gap-2 py-1 text-foreground-700 dark:text-foreground-600">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic">
            {`${t("outgoingWhisper", { character: currentMessage.character?.firstName })}: `}
          </span>
          <span>{currentMessage.message.content}</span>
        </div>
      </div>
    );
  }

  // execute when the user is the master (they can see all whispers - so their id isn't there)
  return (
    <div className="flex items-center gap-2 py-1 text-foreground-700 dark:text-foreground-600">
      <span className="text-xs">{timeString}</span>
      <div className="text-justify">
        <span className="italic">
          {`${t("thirdPartyWhisper", {
            firstCharacter: currentMessage.character?.firstName,
            secondCharacter: currentMessage.recipientCharacter?.firstName,
          })}: `}
        </span>
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
  const t = useTranslations("components.locationChat.messages");

  const createdAt = new Date(currentMessage.message.createdAt);
  const timeString = formatTimeHoursMinutes(createdAt, locale);

  // current user whispers to all
  if (currentMessage.character?.id === currentUserCharacterId) {
    return (
      <div className="flex items-center gap-2 py-1 text-foreground-700 dark:text-foreground-600">
        <span className="text-xs">{timeString}</span>
        <div className="text-justify">
          <span className="italic">{`${t("outgoingWhisperToEverybody")}: `}</span>
          <span>{currentMessage.message.content}</span>
        </div>
      </div>
    );
  }

  // some user whispers to all
  return (
    <div className="flex items-center gap-2 py-1 text-foreground-700 dark:text-foreground-600">
      <span className="text-xs">{timeString}</span>
      <div className="text-justify">
        <span className="italic">
          {`${t("incomingWhisperToEverybody", {
            character: currentMessage.character?.firstName,
          })}: `}
        </span>
        <span>{currentMessage.message.content}</span>
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
  const createdAt = new Date(currentMessage.message.createdAt);
  const timeString = formatTimeHoursMinutes(createdAt, locale);

  const contentWithoutAngleBrackets = replaceAngleBrackets(
    currentMessage.message.content,
  );
  const { guillemetMatcher, squareBracketsMatcher, wordmatcher } =
    generateMatchers(character.firstName);

  return (
    <div className="flex flex-col gap-3 py-1 text-foreground-700 dark:text-foreground-600">
      <div className="flex flex-col justify-center">
        <span className="text-center text-xs">{timeString}</span>
        <span className="text-center">Master screen</span>
      </div>
      <div className="w-full rounded-xl border border-default-200 p-2 text-justify dark:border-default-100">
        <Interweave
          disableLineBreaks
          noHtmlExceptMatchers
          className="text-foreground-700 dark:text-foreground-700"
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
  const createdAt = new Date(currentMessage.message.createdAt);
  const timeString = formatTimeHoursMinutes(createdAt, locale);

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
