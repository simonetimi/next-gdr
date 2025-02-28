import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { OnGameChatContext } from "@/contexts/OnGameChatContext";
import {
  Autocomplete,
  AutocompleteItem,
  Avatar,
  Button,
  Chip,
  Input,
} from "@heroui/react";
import { useMinimalCharacters } from "@/hooks/useMinimalCharacters";
import { useEffect, useRef, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import Editor from "@/components/editor/Editor";
import { Send } from "lucide-react";

type SelectedParticipant = {
  id: string;
  name: string;
  miniAvatarUrl: string | null;
};

export default function NewConversation({
  chatContext,
}: {
  chatContext: OffGameChatContext | OnGameChatContext;
}) {
  const { currentCharacter } = useGame();
  const { characters, isLoading } = useMinimalCharacters();

  const [selectedParticipants, setSelectedParticipants] = useState<
    Set<SelectedParticipant>
  >(new Set());
  const [message, setMessage] = useState("");
  const [groupName, setGroupName] = useState("");

  // filter the user themselves from the list
  const filteredCharacters = characters?.filter(
    (character) => character.id !== currentCharacter?.id,
  );

  const handleSelect = (character: (typeof characters)[0]) => {
    // dont allow duplicates
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

  // reset the movable to the conversation lists when the user closes it
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    return () => chatContext.navigateToConversations();
  }, []);

  return (
    <div className="flex h-full flex-col lg:h-[90%]">
      <div className="flex flex-1 flex-col items-center gap-4 overflow-y-auto p-4">
        <Autocomplete
          className="w-full max-w-sm"
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

        <div className="flex w-full max-w-sm flex-wrap justify-center gap-2">
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
      </div>

      <div className="mt-auto flex flex-col gap-2 p-2">
        {isGroup && (
          <Input
            className="w-full"
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
          />
          <Button
            isIconOnly
            startContent={<Send className="h-5 w-5" />}
            color="primary"
            size="sm"
            className="mb-0.5"
            isDisabled={
              !message.trim() ||
              (isGroup && !groupName.trim()) ||
              selectedParticipants.size === 0
            }
            onPress={() => {
              setMessage("");
            }}
          />
        </div>
      </div>
    </div>
  );
}
