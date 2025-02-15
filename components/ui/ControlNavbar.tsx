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

export default function ControlNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  // manage portal creation and access safety
  // it saves the reference of the portal-root div with useRef and it's accessed safety in the template
  const portalRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    let portal = document.getElementById("portal-root");
    if (!portal) {
      portal = document.createElement("div");
      portal.style.cssText = "width: 100%; height: 100%";
      document.body.prepend(portal);
    }
    portalRef.current = portal as HTMLDivElement;
  }, []);

  const [showExampleMovable, setShowExampleMovable] = useState(false);
  const toggleExampleMovable = () => {
    setShowExampleMovable((prev) => !prev);
  };

  const [showExampleMobileMovable, setShowExampleMobileMovable] =
    useState(false);
  const toggleExampleMobileMovable = () => {
    setIsMenuOpen(false);
    setShowExampleMobileMovable((prev) => !prev);
  };

  // the draggable components are grouped here and conditionally rendered depending on their state

  return (
    <>
      {showExampleMovable &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="main"
            dragHandleClassName="example"
            component={<div>Hi</div>}
            coords={[100, 140]}
            showSetter={setShowExampleMovable}
          />,
          portalRef.current,
        )}
      {showExampleMobileMovable &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="main"
            dragHandleClassName="example"
            component={<div>Hi! I&apos;m on a mobile device.</div>}
            coords={[0, 140]}
            width="100%"
            minHeight="80vh"
            showSetter={setShowExampleMobileMovable}
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
              onPress={toggleExampleMovable}
              color={showExampleMovable ? "primary" : "default"}
            />
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          <NavbarMenuItem className="pt-6">
            <Button
              startContent={<AppWindowMac />}
              size="sm"
              onPress={toggleExampleMobileMovable}
              variant="flat"
            >
              Window
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
}
