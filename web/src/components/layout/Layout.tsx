"use client";

import { ReactNode, useState } from "react";
import { Drawer, DrawerBody, DrawerContent } from "@heroui/react";

import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/AuthStore";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

type LayoutProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export default function Layout({ children, title, subtitle }: LayoutProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleMobileNavigation = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-default-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-default-200 bg-background lg:block">
        <Sidebar onLogout={handleLogout} />
      </aside>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        placement="left"
      >
        <DrawerContent>
          <DrawerBody className="p-0">
            <Sidebar
              onNavigate={handleMobileNavigation}
              onLogout={handleLogout}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={title}
          subtitle={subtitle}
          onMenuPress={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
