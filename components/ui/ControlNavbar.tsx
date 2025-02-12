"use client";

import Movable from "@/components/ui/Movable";
import { GAME_ROUTE } from "@/utils/routes";
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
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function ControlNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const [isExampleMovableOpen, setIsExampleMovableOpen] = useState(false);
  const toggleExampleMovable = () => {
    setIsExampleMovableOpen((prev) => !prev);
  };

  // renders only if on game route
  if (!pathname.startsWith(GAME_ROUTE)) return null;

  return (
    <>
      {
        // the draggable components are conditionally rendered depending on their state
      }
      {isExampleMovableOpen && (
        <Movable
          boundsSelector="main"
          dragHandleClassName="example"
          component={<div>Hi</div>}
          stateSetter={setIsExampleMovableOpen}
        />
      )}
      <Navbar
        className="h-14 w-[800px] rounded-2xl border-1 border-gray-200 dark:border-gray-800"
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
