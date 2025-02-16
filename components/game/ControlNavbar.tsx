"use client";

import Movable from "@/components/ui/Movable";
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
import { ArrowLeftRight, Map, Settings } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { GAME_ROUTE, SELECT_CHARACTER_ROUTE } from "@/utils/routes";
import CharacterSheet from "@/components/game/CharacterSheet";
import { Character } from "@/models/characters";
import { useMediaQuery } from "@uidotdev/usehooks";

import dynamic from "next/dynamic";
import { Tooltip } from "@heroui/tooltip";
import { resetCurrentCharacter } from "@/server/actions/character";

function ControlNavbar({ character }: { character: Character }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const router = useRouter();

  const isMaxWidth850 = useMediaQuery("only screen and (max-width : 850px)");
  useEffect(() => {
    setIsSmallDevice(isMaxWidth850);
  }, [isMaxWidth850]);

  // manage portal creation and access safety
  // it saves the reference of the portal-root div with useRef and it's accessed safety in the template
  const portalRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    let portal = document.getElementById("portal-root");
    if (!portal) {
      portal = document.createElement("div");
      portal.style.cssText = "width: 100%; height: 100%;";
      document.body.prepend(portal);
    }
    portalRef.current = portal as HTMLDivElement;
  }, []);

  const [showCharacterSheetMovable, setShowCharacterSheetMovable] =
    useState(false);
  const toggleCharacterSheetMovable = () => {
    if (isMenuOpen) setIsMenuOpen(false);
    setShowCharacterSheetMovable((prev) => !prev);
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
    <div className="flex flex-grow items-center justify-start gap-3 sm:justify-center">
      {showCharacterSheetMovable &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="main"
            dragHandleClassName="handle"
            component={<CharacterSheet characterId={character.id} />}
            coords={isSmallDevice ? [0, 140] : [0, 110]}
            width={isSmallDevice ? "100vw" : 1000}
            minWidth={isSmallDevice ? "100vw" : 800}
            minHeight={isSmallDevice ? "80vw" : 550}
            height={isSmallDevice ? undefined : 600}
            showSetter={setShowCharacterSheetMovable}
            enableResizing={!isSmallDevice}
            enableMovement={!isSmallDevice}
          />,
          portalRef.current,
        )}
      {showSettingsMovable &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="main"
            dragHandleClassName="handle"
            component={<div>Settings</div>}
            coords={isSmallDevice ? [0, 140] : [0, 110]}
            width={isSmallDevice ? "100vw" : 1000}
            minWidth={isSmallDevice ? "100vw" : 800}
            minHeight={isSmallDevice ? "80vw" : 550}
            height={isSmallDevice ? undefined : 600}
            showSetter={setShowSettingsMovable}
            enableResizing={!isSmallDevice}
            enableMovement={!isSmallDevice}
          />,
          portalRef.current,
        )}
      <Navbar
        className="w-18 rounded-2xl border-0 bg-transparent dark:border-gray-800 sm:w-[300px] sm:border-1 sm:border-gray-200 sm:dark:bg-black"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="mr-auto sm:hidden"
        />
        <NavbarContent className="hidden gap-4 sm:flex" justify="center">
          <NavbarItem>
            <Tooltip content="Map">
              <Button
                isIconOnly
                startContent={<Map />}
                size="sm"
                onPress={() => router.push(GAME_ROUTE)}
              />
            </Tooltip>
          </NavbarItem>
          <NavbarItem>
            <Tooltip content="Settings">
              <Button
                isIconOnly
                startContent={<Settings />}
                size="sm"
                onPress={toggleSettingsMovable}
                color={showSettingsMovable ? "primary" : "default"}
              />
            </Tooltip>
          </NavbarItem>
          <NavbarItem>
            <Tooltip content="Switch character">
              <Button
                isIconOnly
                startContent={<ArrowLeftRight />}
                size="sm"
                onPress={handleOnPressResetCharacter}
                className="hover:bg-warning"
              />
            </Tooltip>
          </NavbarItem>
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
              Main map
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem className="flex flex-col">
            <Button
              startContent={<Settings />}
              size="lg"
              onPress={toggleSettingsMovable}
              variant="light"
            >
              Settings
            </Button>
          </NavbarMenuItem>
          <NavbarMenuItem className="flex flex-col">
            <Button
              startContent={<ArrowLeftRight />}
              size="lg"
              onPress={handleOnPressResetCharacter}
              variant="light"
            >
              Switch characters
            </Button>
          </NavbarMenuItem>
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
    </div>
  );
}

export default dynamic(() => Promise.resolve(ControlNavbar), {
  ssr: false,
});
