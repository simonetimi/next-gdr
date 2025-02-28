"use client";

import { useGame } from "@/contexts/GameContext";

import {
  Button,
  Navbar,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Avatar,
} from "@heroui/react";
import {
  ArrowLeftRight,
  BadgeCheck,
  Eye,
  EyeOff,
  Mail,
  Map,
  MessageCircle,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ADMIN_ROUTE,
  GAME_ROUTE,
  MODERATION_ROUTE,
  SELECT_CHARACTER_ROUTE,
} from "@/utils/routes";
import { Character } from "@/models/characters";
import { useMediaQuery } from "@uidotdev/usehooks";

import dynamic from "next/dynamic";
import { Tooltip } from "@heroui/tooltip";
import { resetCurrentCharacter } from "@/server/actions/character";
import { toggleInvisible } from "@/server/actions/app";
import { useInvisibleStatus } from "@/hooks/useInvisibleStatus";
import CharacterSheetPortal from "@/components/portals/CharacterSheetPortal";
import SettingsPortal from "@/components/portals/SettingsPortal";
import OnlineCharactersPortal from "@/components/portals/OnlineCharactersPortal";
import { Badge } from "@heroui/badge";
import { useTranslations } from "next-intl";
import OffGameChatPortal from "@/components/portals/OffGameChatPortal";

function ControlNavbar({
  character,
  allowMultipleCharacters,
  isAdmin,
  isMaster,
}: {
  character: Character;
  allowMultipleCharacters?: boolean;
  isAdmin?: boolean;
  isMaster?: boolean;
}) {
  const game = useGame();
  const t = useTranslations("components.controlNavbar");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const router = useRouter();

  const isMaxWidth850 = useMediaQuery("only screen and (max-width : 850px)");
  useEffect(() => {
    setIsSmallDevice(isMaxWidth850);
  }, [isMaxWidth850]);

  const { isInvisible, mutate } = useInvisibleStatus();

  const handleToggleInvisible = async () => {
    await toggleInvisible(isInvisible);
    mutate();
  };

  const toggleCharacterSheetMovable = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    game.toggleCharacterSheet(character.id);
  };

  const [showOnlineUsersMovable, setOnlineUsersMovable] = useState(false);
  const toggleOnlineUsersMovable = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setOnlineUsersMovable((prev) => !prev);
  };

  const [showOffGameMessagesMovable, setShowOffGameMessagesMovable] =
    useState(false);
  const toggleOffGameMessagesMovable = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setShowOffGameMessagesMovable((prev) => !prev);
  };

  const [showOnGameMessagesMovable, setShowOnGameMessagesMovable] =
    useState(false);
  const toggleOnGameMessagesMovable = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setShowOnGameMessagesMovable((prev) => !prev);
  };

  const [showSettingsMovable, setShowSettingsMovable] = useState(false);
  const toggleSettingsMovable = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setShowSettingsMovable((prev) => !prev);
  };

  const handleOnPressResetCharacter = async () => {
    const success = await resetCurrentCharacter();
    if (success) {
      router.push(SELECT_CHARACTER_ROUTE);
    }
  };

  // the draggable components are grouped here and conditionally rendered depending on their state
  // buttons on the navbar activate movables for large screens. instead, buttons on the side menu will open small screen movables
  return (
    <div className="flex flex-grow items-center justify-start gap-0 sm:justify-center sm:gap-3">
      <CharacterSheetPortal isSmallDevice={isSmallDevice} />
      <OnlineCharactersPortal
        isSmallDevice={isSmallDevice}
        show={showOnlineUsersMovable}
        setShow={setOnlineUsersMovable}
      />
      <OffGameChatPortal
        isSmallDevice={isSmallDevice}
        show={showOffGameMessagesMovable}
        setShow={setShowOffGameMessagesMovable}
      />
      <SettingsPortal
        isSmallDevice={isSmallDevice}
        show={showSettingsMovable}
        setShow={setShowSettingsMovable}
      />
      <Navbar
        className="w-18 rounded-2xl border-0 bg-transparent dark:border-gray-800 sm:w-fit sm:border-1 sm:border-gray-200 sm:dark:bg-black"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="-ml-5 mr-auto h-6 w-6 sm:hidden"
        />
        <NavbarContent className="hidden sm:flex sm:gap-4" justify="center">
          <NavbarItem>
            <Tooltip content={t("map")}>
              <Button
                isIconOnly
                startContent={<Map />}
                size="sm"
                onPress={() => router.push(GAME_ROUTE)}
                variant="light"
              />
            </Tooltip>
          </NavbarItem>
          <NavbarItem>
            <Tooltip content={t("onlineCharacters")}>
              <Button
                isIconOnly
                startContent={<Users />}
                size="sm"
                onPress={toggleOnlineUsersMovable}
                color={showOnlineUsersMovable ? "primary" : "default"}
                variant="light"
              />
            </Tooltip>
          </NavbarItem>
          <NavbarItem>
            <Badge color="primary" content="4">
              <Tooltip content={t("offGameMessages")}>
                <Button
                  isIconOnly
                  startContent={<Mail />}
                  size="sm"
                  onPress={toggleOffGameMessagesMovable}
                  color={showOffGameMessagesMovable ? "primary" : "default"}
                  variant="light"
                />
              </Tooltip>
            </Badge>
          </NavbarItem>
          <NavbarItem>
            <Tooltip content={t("onGameMessages")}>
              <Button
                isIconOnly
                startContent={<MessageCircle />}
                size="sm"
                onPress={toggleOnGameMessagesMovable}
                variant="light"
              />
            </Tooltip>
          </NavbarItem>
          <NavbarItem>
            <Tooltip content={t("settings")}>
              <Button
                isIconOnly
                startContent={<Settings />}
                size="sm"
                onPress={toggleSettingsMovable}
                color={showSettingsMovable ? "primary" : "default"}
                variant="light"
              />
            </Tooltip>
          </NavbarItem>
          {allowMultipleCharacters && (
            <NavbarItem>
              <Tooltip content={t("switchCharacter")}>
                <Button
                  isIconOnly
                  startContent={<ArrowLeftRight />}
                  size="sm"
                  onPress={handleOnPressResetCharacter}
                  className="hover:bg-warning"
                  variant="light"
                />
              </Tooltip>
            </NavbarItem>
          )}
          {isMaster && (
            <NavbarItem>
              <Tooltip content={t("moderation")}>
                <Button
                  isIconOnly
                  startContent={<BadgeCheck />}
                  size="sm"
                  onPress={() => router.push(MODERATION_ROUTE)}
                  variant="light"
                />
              </Tooltip>
            </NavbarItem>
          )}
          {isAdmin && (
            <NavbarItem>
              <Tooltip content={t("adminDashboard")}>
                <Button
                  isIconOnly
                  startContent={<Shield />}
                  size="sm"
                  onPress={() => router.push(ADMIN_ROUTE)}
                  variant="light"
                />
              </Tooltip>
            </NavbarItem>
          )}
        </NavbarContent>
        <NavbarMenu className="mt-10 flex flex-col gap-4">
          <NavbarMenuItem className="flex flex-col">
            <Button
              startContent={<Map />}
              size="lg"
              onPress={() => {
                setIsMenuOpen(false);
                router.push(GAME_ROUTE);
              }}
              variant="light"
            >
              {t("map")}
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem className="flex flex-col">
            <Button
              startContent={<Users />}
              size="lg"
              onPress={toggleOnlineUsersMovable}
              variant="light"
            >
              {t("onlineCharacters")}
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem className="flex flex-col">
            <Button
              startContent={<Mail />}
              size="lg"
              onPress={toggleOffGameMessagesMovable}
              variant="light"
            >
              {t("offGameMessages")}
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem className="flex flex-col">
            <Button
              startContent={<MessageCircle />}
              size="lg"
              onPress={toggleOnGameMessagesMovable}
              variant="light"
            >
              {t("onGameMessages")}
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem className="flex flex-col">
            <Button
              startContent={<Settings />}
              size="lg"
              onPress={toggleSettingsMovable}
              variant="light"
            >
              {t("settings")}
            </Button>
          </NavbarMenuItem>
          {allowMultipleCharacters && (
            <NavbarMenuItem className="flex flex-col">
              <Button
                startContent={<ArrowLeftRight />}
                size="lg"
                onPress={handleOnPressResetCharacter}
                variant="light"
              >
                {t("switchCharacter")}
              </Button>
            </NavbarMenuItem>
          )}
          {isMaster && (
            <NavbarMenuItem className="flex flex-col">
              <Button
                startContent={<BadgeCheck />}
                size="lg"
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push(MODERATION_ROUTE);
                }}
                variant="light"
              >
                {t("moderation")}
              </Button>
            </NavbarMenuItem>
          )}
          {isAdmin && (
            <NavbarMenuItem className="flex flex-col">
              <Button
                startContent={<Shield />}
                size="lg"
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push(ADMIN_ROUTE);
                }}
                variant="light"
              >
                {t("adminDashboard")}
              </Button>
            </NavbarMenuItem>
          )}
          {isMaster && (
            <NavbarMenuItem className="flex flex-col">
              <Button
                startContent={isInvisible ? <EyeOff /> : <Eye />}
                size="lg"
                onPress={handleToggleInvisible}
                color={isInvisible ? "primary" : "default"}
                variant="light"
              >
                {t("toggleInvisible")}
              </Button>
            </NavbarMenuItem>
          )}
        </NavbarMenu>
      </Navbar>
      <Tooltip content={character.firstName}>
        <Avatar
          src={character.miniAvatarUrl ?? ""}
          name={character.firstName}
          className="mr-4 h-12 w-12 cursor-pointer"
          onClick={toggleCharacterSheetMovable}
        />
      </Tooltip>
      {isMaster && !isSmallDevice && (
        <Tooltip content={t("toggleInvisible")}>
          <Button
            isIconOnly
            startContent={isInvisible ? <EyeOff /> : <Eye />}
            size="sm"
            onPress={handleToggleInvisible}
            color={isInvisible ? "primary" : "default"}
            variant="flat"
          ></Button>
        </Tooltip>
      )}
    </div>
  );
}

export default dynamic(() => Promise.resolve(ControlNavbar), {
  ssr: false,
});
