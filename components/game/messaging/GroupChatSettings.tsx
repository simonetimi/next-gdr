import { useEffect, useState } from "react";
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
  Avatar,
  Chip,
  Select,
  SelectItem,
} from "@heroui/react";
import ParticipantSelector from "@/components/game/messaging/ParticipantSelector";
import {
  addParticipantToConversation,
  removeParticipantFromConversation,
  editGroupConversationName,
  deleteGroupConversation,
  changeGroupConversationAdmin,
} from "@/server/actions/offGameChat";
import { OffGameChatContext } from "@/contexts/OffGameChatContext";
import { useConversationDetails } from "@/hooks/swr/useConversationDetails";
import {
  ArrowLeftIcon,
  Save,
  ShieldUser,
  Trash2,
  UserPlus,
  UserRoundPen,
} from "lucide-react";
import { useMinimalCharacters } from "@/hooks/swr/useMinimalCharacters";

// imp! conversationDetails will return all the participants that are or were part of the conversations
// make sure to filter out those with isRemoved flag set to true

export default function GroupChatSettings({
  chatContext,
}: {
  chatContext: OffGameChatContext;
}) {
  const t = useTranslations();

  const { characters, isLoading } = useMinimalCharacters();

  const { conversationDetails, refreshDetails } = useConversationDetails(
    chatContext.type,
    chatContext.currentConversation?.id ?? "",
  );

  const participants = conversationDetails?.participants.filter(
    (p) => !p.isRemoved,
  );

  const [groupName, setGroupName] = useState<string>("");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [newAdminId, setNewAdminId] = useState<string>("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingAdmin, setIsChangingAdmin] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);

  const handleChangeAdmin = async () => {
    if (!newAdminId) return;

    setIsChangingAdmin(true);
    try {
      await changeGroupConversationAdmin(
        chatContext.currentConversation?.id ?? "",
        newAdminId,
      );
      setIsAdminDialogOpen(false);
      addToast({
        title: t("components.gameChat.settings.adminChanged"),
        color: "success",
      });
      chatContext.navigateToEditor(chatContext.currentConversation);
    } catch (error) {
      addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
    } finally {
      setIsChangingAdmin(false);
    }
  };

  const handleRename = async () => {
    if (!groupName.trim()) return;

    setIsRenaming(true);
    try {
      await editGroupConversationName(
        chatContext.currentConversation?.id ?? "",
        groupName,
      );
      addToast({
        title: t("components.gameChat.settings.conversationRenamed", {
          newName: groupName,
        }),
        color: "success",
      });
      await refreshDetails();
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

    // find the character from the characters list
    const selectedCharacter = characters?.find(
      (c) => c.id === selectedCharacterId,
    );
    if (!selectedCharacter) return;

    setIsAddingParticipant(true);
    try {
      await addParticipantToConversation(
        chatContext.currentConversation?.id ?? "",
        selectedCharacterId,
      );

      setSelectedCharacterId("");
      await refreshDetails();
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
    if (participants?.length === 2) {
      return addToast({
        title: t("errors.gameChat.onlyTwoParticipantsLeft"),
        color: "warning",
      });
    }

    try {
      await removeParticipantFromConversation(
        chatContext.currentConversation?.id ?? "",
        characterId,
      );
      await refreshDetails();
    } catch (error) {
      addToast({
        title: t("errors.title"),
        description:
          error instanceof Error ? error.message : t("errors.generic"),
        color: "danger",
      });
    }
  };

  const handleDeleteConversation = async () => {
    setIsDeleting(true);
    try {
      await deleteGroupConversation(chatContext.currentConversation?.id ?? "");
      addToast({
        title: t("components.gameChat.settings.conversationRemoved"),
        color: "success",
      });
      chatContext.navigateToConversations();
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

  if (!conversationDetails) {
    return <div className="p-4">Loading...</div>;
  }

  const admin = participants?.find((p) => p.id === conversationDetails.adminId);

  return (
    <div className="flex h-4/5 flex-col">
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-2 p-2">
        <Button
          isIconOnly
          size="sm"
          startContent={<ArrowLeftIcon />}
          variant="light"
          onPress={() =>
            chatContext.navigateToEditor(chatContext.currentConversation)
          }
        />
        <h2 className="text-center text-lg font-medium">
          {t("components.gameChat.settings.title")}
        </h2>
        <div />
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* group name section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("components.gameChat.settings.groupName")}
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={groupName}
              onValueChange={setGroupName}
              placeholder={t("components.gameChat.settings.enterName")}
              className="flex-1"
              onKeyDown={async (e) => {
                if (e.key === "Enter") {
                  await handleRename();
                }
              }}
            />
            <Button
              isIconOnly
              color="primary"
              size="sm"
              startContent={!isRenaming && <Save className="h-5 w-5" />}
              onPress={handleRename}
              isLoading={isRenaming}
              isDisabled={!groupName.trim() || isRenaming}
            />
          </div>
        </div>

        {/* Admin section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("components.gameChat.settings.admin")}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 dark:bg-primary/30">
              <Avatar
                showFallback
                className="h-5 w-5"
                name={admin?.name?.[0] || ""}
                src={admin?.avatarUrl ?? undefined}
              />
              <span className="text-sm">{admin?.name}</span>
              <ShieldUser className="h-4 w-4 text-primary" />
            </div>
            <Button
              isIconOnly
              startContent={<UserRoundPen className="h-5 w-5" />}
              size="sm"
              variant="light"
              onPress={() => setIsAdminDialogOpen(true)}
            />
          </div>
        </div>

        {/* participants section */}
        <div className="space-y-3">
          <label className="text-sm font-medium">
            {t("components.gameChat.settings.participants")}
          </label>

          <div className="flex items-center gap-2">
            <ParticipantSelector
              characters={characters}
              isLoading={isLoading}
              value={selectedCharacterId}
              onChange={setSelectedCharacterId}
              excludeIds={participants?.map((p) => p.id)}
            />
            <Button
              isIconOnly
              startContent={
                !isAddingParticipant && <UserPlus className="h-5 w-5" />
              }
              color="primary"
              size="sm"
              isDisabled={!selectedCharacterId || isAddingParticipant}
              isLoading={isAddingParticipant}
              onPress={handleAddParticipant}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {participants
              ?.filter(
                (participant) => participant.id !== conversationDetails.adminId,
              )
              .map((participant) => (
                <Chip
                  key={participant.id}
                  onClose={() => handleRemoveParticipant(participant.id)}
                  avatar={
                    <Avatar
                      showFallback
                      className="h-5 w-5"
                      name={participant.name[0]}
                      src={participant.avatarUrl ?? undefined}
                    />
                  }
                >
                  {participant.name}
                </Chip>
              ))}
          </div>
        </div>
      </div>

      {/* delete conversation */}
      <footer className="mt-auto">
        <Button
          color="danger"
          startContent={<Trash2 className="h-5 w-5" />}
          onPress={() => setIsDeleteDialogOpen(true)}
          className="w-full"
        >
          {t("components.gameChat.settings.deleteConversation")}
        </Button>
      </footer>

      {/* change admin modal */}
      <Modal isOpen={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <ModalContent>
          <ModalHeader>
            {t("components.gameChat.settings.selectNewAdmin")}
          </ModalHeader>
          <ModalBody>
            <Select
              label={t("components.gameChat.settings.selectParticipant")}
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
            >
              {conversationDetails.participants
                .filter((p) => p.id !== conversationDetails.adminId)
                .map((participant) => (
                  <SelectItem key={participant.id}>
                    {participant.name}
                  </SelectItem>
                ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={() => setIsAdminDialogOpen(false)}
              isDisabled={isChangingAdmin}
            >
              {t("components.gameChat.settings.cancel")}
            </Button>
            <Button
              color="primary"
              onPress={handleChangeAdmin}
              isDisabled={!newAdminId || isChangingAdmin}
              isLoading={isChangingAdmin}
            >
              {t("components.gameChat.settings.confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* delete confirmation modal */}
      <Modal isOpen={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <ModalContent>
          <ModalHeader>{t("components.gameChat.settings.confirm")}</ModalHeader>
          <ModalBody>
            <p>{t("components.gameChat.settings.confirmDeleteMessage")}</p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="bordered"
              onPress={() => setIsDeleteDialogOpen(false)}
              isDisabled={isDeleting}
            >
              {t("components.gameChat.settings.cancel")}
            </Button>
            <Button
              color="danger"
              onPress={handleDeleteConversation}
              isDisabled={isDeleting}
              isLoading={isDeleting}
            >
              {t("components.gameChat.settings.deleteConversation")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
