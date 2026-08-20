"use client";

import { ReactNode, useState } from "react";

import { Drawer, DrawerBody, DrawerContent } from "@heroui/react";

import NavigationSidebar from "./NavigationSidebar";
import SettingsSidebar from "./SettingsSidebar";
import Navbar from "./Navbar";

type LayoutProps = {
  children: ReactNode;
  title: string;
};

export default function Layout({ children, title }: LayoutProps) {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleNavigation = () => {
    setNavigationOpen(false);
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-default-50">
      {/* Navigation Sidebar */}
      <Drawer
        isOpen={navigationOpen}
        onOpenChange={setNavigationOpen}
        placement="left"
      >
        <DrawerContent className="w-60 max-w-60">
          <DrawerBody className="p-0">
            <NavigationSidebar onNavigate={handleNavigation} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Settings Sidebar */}
      <Drawer
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
        placement="right"
      >
        <DrawerContent className="w-60 max-w-60">
          <DrawerBody className="p-0">
            <SettingsSidebar onClose={handleSettingsClose} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={title}
          onMenuPress={() => setNavigationOpen(true)}
          onSettingsPress={() => setSettingsOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
