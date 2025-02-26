import { useLayoutEffect, useRef } from "react";

// manage portal creation and access safety
// it saves the reference of the portal-root div with useRef and it's accessed safely in the template
export function usePortalRoot() {
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

  return portalRef;
}
