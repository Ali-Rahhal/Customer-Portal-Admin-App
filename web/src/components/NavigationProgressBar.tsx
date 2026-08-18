"use client";

import { Progress } from "@heroui/react";
import { usePathname } from "@/i18n/navigation";
import { useEffect, useState } from "react";

export default function NavigationProgressBar() {
  const pathname = usePathname();

  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      // Only normal left clicks
      if (event.button !== 0) return;

      // Ignore modifier clicks
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement;
      const link = target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href) return;

      // Ignore external links
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("//")
      ) {
        return;
      }

      // Ignore hash links
      if (href.startsWith("#")) return;

      // Ignore downloads
      if (link.hasAttribute("download")) return;

      // Ignore new tabs/windows
      if (link.target && link.target !== "_self") {
        return;
      }

      const targetUrl = new URL(href, window.location.origin);

      const targetPath = targetUrl.pathname + targetUrl.search;

      const currentPath = window.location.pathname + window.location.search;

      // Same page
      if (targetPath === currentPath) return;

      setNavigationTarget(targetPath);
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  const isNavigating =
    navigationTarget !== null && navigationTarget !== pathname;

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed left-0 top-0 z-9999 w-full">
      <Progress
        aria-label="Loading"
        isIndeterminate
        size="sm"
        color="primary"
        className="w-full"
      />
    </div>
  );
}
