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
import { AppWindowMac } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ControlNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // manage portal creation and access safety
  // it saves the reference of the portal-root div with useRef and it's accessed safety in the template
  const portalRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    let portal = document.getElementById("portal-root");
    if (!portal) {
      portal = document.createElement("div");
      portal.style.cssText = "width: 90%; height: 90%";
      document.body.prepend(portal);
    }
    portalRef.current = portal as HTMLDivElement;
  }, []);

  const [showExampleMovable, setShowExampleMovable] = useState(false);
  const toggleExampleMovable = () => {
    setShowExampleMovable((prev) => !prev);
  };

  // the draggable components are grouped here and conditionally rendered depending on their state

  // TODO decide what to do with the movables and smaller screens
  // could render the movable full screen (it's easy to do, 100% on width and height + non resizable)
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
      <Navbar
        className="w-18 rounded-2xl border-0 bg-transparent dark:border-gray-800 sm:w-[300px] sm:border-1 sm:border-gray-200 sm:dark:bg-black"
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
              startContent={<AppWindowMac />}
              size="sm"
              onPress={toggleExampleMovable}
              color={showExampleMovable ? "primary" : "default"}
            />
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu className="z-50">
          <NavbarMenuItem>
            <Button
              startContent={<AppWindowMac />}
              size="sm"
              onPress={toggleExampleMovable}
            >
              Window
            </Button>
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
}
