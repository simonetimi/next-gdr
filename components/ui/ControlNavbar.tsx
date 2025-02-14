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

  // the draggable components are groupped here and conditionally rendered depending on their state

  return (
    <>
      {showExampleMovable &&
        portalRef.current &&
        createPortal(
          <Movable
            boundsSelector="main"
            dragHandleClassName="example"
            component={<div>Hi</div>}
            showSetter={setShowExampleMovable}
          />,
          portalRef.current,
        )}
      <Navbar
        className="h-14 w-[800px] rounded-2xl border-1 border-gray-200 bg-transparent dark:border-gray-800"
        onMenuOpenChange={setIsMenuOpen}
      >
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="mr-auto sm:hidden"
        />
        <NavbarContent>
          <NavbarItem>
            <Button
              isIconOnly
              startContent={<AppWindowMac />}
              size="sm"
              onPress={toggleExampleMovable}
            />
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          <NavbarMenuItem>
            <Button
              isIconOnly
              startContent={<AppWindowMac />}
              size="sm"
              onPress={toggleExampleMovable}
            />
          </NavbarMenuItem>
        </NavbarMenu>
      </Navbar>
    </>
  );
}
