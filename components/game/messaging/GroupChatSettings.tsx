"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  addToast,
} from "@heroui/react";
import ParticipantSelector from "@/components/game/messaging/ParticipantSelector";
import {
  addParticipantToConversation,
  removeParticipantFromConversation,
  editGroupConversationName,
  deleteGroupConversation,
} from "@/server/actions/offGameChat";
import { useRouter } from "next/navigation";

interface GroupChatSettingsProps {
  conversationId: string;
  name: string;
  participants: {
    id: string;
    characterId: string;
    firstName: string;
    lastName?: string;
  }[];
}

export default function GroupChatSettings({
  conversationId,
  name,
  participants,
}: GroupChatSettingsProps) {
  const t = useTranslations();
  const router = useRouter();

  const [chatName, setChatName] = useState(name);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [isRemovingParticipant, setIsRemovingParticipant] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRename = async () => {
    if (!chatName.trim() || chatName === name) return;

    setIsRenaming(true);
    try {
      await editGroupConversationName(conversationId, chatName);
      addToast({
        title: t("system.gameChat.conversationRenamed", { newName: chatName }),
        color: "success",
      });
      router.refresh();
    } catch (error) {
      addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
    } finally {
      setIsRenaming(false);
    }
  };

  const handleAddParticipant = async () => {
    if (!selectedCharacterId) return;

    setIsAddingParticipant(true);
    try {
      await addParticipantToConversation(conversationId, selectedCharacterId);
      addToast({
        title: t("game.chat.participantAdded"),
        color: "success",
      });
      setSelectedCharacterId("");
      router.refresh();
    } catch (error) {
      addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
    } finally {
      setIsAddingParticipant(false);
    }
  };

  const handleRemoveParticipant = async (characterId: string) => {
    setIsRemovingParticipant(true);
    try {
      await removeParticipantFromConversation(conversationId, characterId);
      addToast({
        title: t("game.chat.participantRemoved"),
        color: "success",
      });
      router.refresh();
    } catch (error) {
      addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
    } finally {
      setIsRemovingParticipant(false);
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      await deleteGroupConversation(conversationId);
      addToast({
        title: t("game.gameChat.conversationRemoved"),
        color: "success",
      });
      router.push("/game/chat");
    } catch (error) {
      addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-medium">{t("group.settings")}</h3>
        <p className="text-muted-foreground text-sm">
          {t("group.manageSettings")}
        </p>
      </div>

      {/* Chat name section */}
      <div className="space-y-2">
        <span className="mb-1 block text-sm font-medium">
          {t("group.name")}
        </span>
        <div className="flex gap-2">
          <Input
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder={t("group.enterName")}
          />
          <Button
            onPress={handleRename}
            isDisabled={isRenaming || chatName === name || !chatName.trim()}
          >
            {isRenaming ? t("saving") : t("save")}
          </Button>
        </div>
      </div>

      {/* Participants section */}
      <div className="space-y-3">
        <h4 className="font-medium">{t("group.participants")}</h4>
        <ul className="space-y-2">
          {participants.map((participant) => (
            <li
              key={participant.characterId}
              className="flex items-center justify-between rounded-md border p-2"
            >
              <span>
                {participant.firstName} {participant.lastName}
              </span>
              <Button
                color="danger"
                size="sm"
                onPress={() => handleRemoveParticipant(participant.characterId)}
                isDisabled={isRemovingParticipant}
              >
                {t("remove")}
              </Button>
            </li>
          ))}
        </ul>
      </div>

      {/* Add participant section */}
      <div className="space-y-3">
        <h4 className="font-medium">{t("group.addParticipant")}</h4>
        <div className="flex gap-2">
          <div className="flex-1">
            <ParticipantSelector
              value={selectedCharacterId}
              onChange={setSelectedCharacterId}
              excludeIds={participants.map((p) => p.characterId)}
            />
          </div>
          <Button
            onPress={handleAddParticipant}
            isDisabled={!selectedCharacterId || isAddingParticipant}
          >
            {t("add")}
          </Button>
        </div>
      </div>

      {/* Delete conversation section */}
      <div className="border-t pt-4">
        <Button color="danger" onPress={() => setIsDeleteDialogOpen(true)}>
          {t("group.deleteConversation")}
        </Button>
        <Modal isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <ModalContent>
            <ModalHeader>{t("group.confirmDelete")}</ModalHeader>
            <ModalBody>
              <p>{t("group.deleteWarning")}</p>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="bordered"
                onPress={() => setIsDeleteDialogOpen(false)}
                isDisabled={isDeleting}
              >
                {t("cancel")}
              </Button>
              <Button
                color="danger"
                onPress={handleDeleteConversation}
                isDisabled={isDeleting}
              >
                {isDeleting ? t("deleting") : t("delete")}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
}
