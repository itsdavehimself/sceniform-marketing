import { type ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

const Portal = ({ children }: PortalProps) => {
  const portalRoot = document.getElementById("portal-root");

  if (!portalRoot) {
    console.warn(
      "Portal root not found. Please add <div id='portal-root'></div> to your index.html",
    );
    return null;
  }

  return createPortal(children, portalRoot);
};

export default Portal;
