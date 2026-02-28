import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import type { ReactElement } from "react";

const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default ProtectedRoute;
