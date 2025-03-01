import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { OnGameChatContext } from "@/contexts/OnGameChatContext";
import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Chip,
  Input,
} from "@heroui/react";
import { useMinimalCharacters } from "@/hooks/swr/useMinimalCharacters";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import Editor from "@/components/editor/Editor";
import { ArrowLeftIcon, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createGroupOffGameConversation,
  createSingleOffGameConversation,
} from "@/server/actions/offGameChat";

type SelectedParticipant = {
  id: string;
  name: string;
  miniAvatarUrl: string | null;
};

export default function NewConversation({
  chatContext,
}: {
  chatContext: OffGameChatContext;
}) {
  const t = useTranslations();
  const { currentCharacter } = useGame();
  const { characters, isLoading } = useMinimalCharacters();

  const [selectedParticipants, setSelectedParticipants] = useState<
    Set<SelectedParticipant>
  >(new Set());
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmittedRef = useRef(false);

  // filter the user themselves from the list
  const filteredCharacters = characters?.filter(
    (character) => character.id !== currentCharacter?.id,
  );

  const handleSelect = (character: (typeof characters)[0]) => {
    // don't allow duplicates
    const isDuplicate = [...selectedParticipants].some(
      (participant) => participant.id === character.id,
    );

    if (!isDuplicate) {
      const newParticipants = new Set(selectedParticipants);
      newParticipants.add({
        id: character.id,
        name: character.firstName,
        miniAvatarUrl: character.miniAvatarUrl,
      });
      setSelectedParticipants(newParticipants);
    }
  };

  const handleRemoveParticipant = (id: string) => {
    const newParticipants = new Set(selectedParticipants);
    for (const participant of newParticipants) {
      if (participant.id === id) {
        newParticipants.delete(participant);
        break;
      }
    }
    setSelectedParticipants(newParticipants);
  };

  const isGroup = selectedParticipants.size > 1;

  const handleSubmitNewConversation = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const participantIds = [...selectedParticipants].map(
        (participant) => participant.id,
      );

      // determine the action to call based on chat type and group status
      let conversation;

      if (chatContext.type === "off") {
        if (isGroup) {
          conversation = await createGroupOffGameConversation(
            groupName,
            participantIds,
            message,
          );
        } else {
          conversation = await createSingleOffGameConversation(
            participantIds[0],
            message,
          );
        }
      } else {
        // On-game chat logic here
      }

      hasSubmittedRef.current = true;
      // navigate to the editor with the right conversation id
      chatContext.navigateToEditor(conversation ?? null);
    } catch (error) {
      addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // reset the movable to the conversation lists when the user closes it - runs on dismount
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    // condition !hasSubmittedRef avoids resetting after successful submission
    return () => {
      if (!hasSubmittedRef.current) {
        chatContext.navigateToConversations();
      }
    };
  }, [chatContext]);

  return (
    <div className="flex h-full flex-col lg:h-[90%]">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2">
        <Button
          isIconOnly
          variant="light"
          onPress={chatContext.navigateToConversations}
          disabled={isSubmitting}
        >
          <ArrowLeftIcon />
        </Button>
        <Autocomplete
          className="max-w-sm justify-self-center"
          label="Select character"
          isLoading={isLoading}
          onSelectionChange={(key) => {
            if (key && characters) {
              const selectedCharacter = characters.find((c) => c.id === key);
              if (selectedCharacter) {
                handleSelect(selectedCharacter);
              }
            }
          }}
        >
          {filteredCharacters &&
            filteredCharacters.map((character) => (
              <AutocompleteItem
                key={character.id}
                textValue={character.firstName}
                startContent={
                  <Avatar
                    showFallback
                    className="h-6 w-6"
                    name={character.firstName[0]}
                    src={character.miniAvatarUrl ?? undefined}
                  />
                }
              >
                {character.firstName}
              </AutocompleteItem>
            ))}
        </Autocomplete>
        <div />
      </header>

      <section className="flex flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex w-full max-w-sm flex-wrap justify-center gap-2">
          {[...selectedParticipants].map((participant) => (
            <Chip
              key={participant.id}
              onClose={() => handleRemoveParticipant(participant.id)}
              avatar={
                <Avatar
                  showFallback
                  className="h-5 w-5"
                  name={participant.name[0]}
                  src={participant.miniAvatarUrl ?? undefined}
                />
              }
            >
              {participant.name}
            </Chip>
          ))}
        </div>
      </section>

      <footer className="mt-auto space-y-2 p-2">
        {isGroup && (
          <Input
            className="w-[200px]"
            label="Group name"
            placeholder="Enter group name"
            value={groupName}
            onValueChange={setGroupName}
          />
        )}
        <div className="flex items-end gap-2">
          <Editor
            content={message}
            onContentChange={setMessage}
            containerClass="flex-1"
            editorClass="h-[100px]"
            onKeyDown={async (e) => {
              // send message on enter without shift (shift+enter is for new line)
              if (e.key === "Enter" && !e.shiftKey && message.trim()) {
                e.preventDefault(); // prevent default to avoid new line
                await handleSubmitNewConversation();
              }
            }}
          />
          <Button
            isIconOnly
            startContent={isSubmitting ? null : <Send className="h-5 w-5" />}
            color="primary"
            size="sm"
            className="mb-0.5"
            isLoading={isSubmitting}
            isDisabled={
              isSubmitting ||
              !message.trim() ||
              (isGroup && !groupName.trim()) ||
              selectedParticipants.size === 0
            }
            onPress={handleSubmitNewConversation}
          />
        </div>
      </footer>
    </div>
  );
}
