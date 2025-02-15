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
} from "@heroui/react";
import { AppWindowMac, Map } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { GAME_ROUTE } from "@/utils/routes";
import CharacterSheet from "@/components/game/CharacterSheet";
import { Character } from "@/models/characters";

export default function ControlNavbar({ character }: { character: Character }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

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
    setShowCharacterSheetMovable((prev) => !prev);
  };

  const [showCharacterSheetMobileMovable, setShowCharacterSheetMobileMovable] =
    useState(false);
  const toggleCharacterSheetMobileMovable = () => {
    setIsMenuOpen(false);
    setShowCharacterSheetMobileMovable((prev) => !prev);
  };

  // the draggable components are grouped here and conditionally rendered depending on their state

  return (
    <>
      {showCharacterSheetMovable &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="main"
            dragHandleClassName="example"
            component={<CharacterSheet characterId={character.id} />}
            coords={[100, 140]}
            showSetter={setShowCharacterSheetMovable}
          />,
          portalRef.current,
        )}
      {showCharacterSheetMobileMovable &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="main"
            dragHandleClassName="example"
            component={<CharacterSheet characterId={character.id} />}
            coords={[0, 140]}
            width="100vw"
            minHeight="80vh"
            showSetter={setShowCharacterSheetMobileMovable}
            enableResizing={false}
            enableMovement={false}
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
            <Button
              isIconOnly
              startContent={<Map />}
              size="sm"
              onPress={() => router.push(GAME_ROUTE)}
            />
          </NavbarItem>
          <NavbarItem>
            <Button
              isIconOnly
              startContent={<AppWindowMac />}
              size="sm"
              onPress={toggleCharacterSheetMovable}
              color={showCharacterSheetMovable ? "primary" : "default"}
            />
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          <NavbarMenuItem className="flex flex-col gap-4 pt-6">
            <Button
              startContent={<Map />}
              size="sm"
              onPress={() => {
                setIsMenuOpen(false);
                router.push(GAME_ROUTE);
              }}
              variant="flat"
            >
              Main map
            </Button>
            <Button
              startContent={<AppWindowMac />}
              size="sm"
              onPress={toggleCharacterSheetMobileMovable}
              variant="flat"
            >
              Character scheet
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
}
