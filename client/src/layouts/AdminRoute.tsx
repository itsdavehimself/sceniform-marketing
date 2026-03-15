import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import React from "react";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, orgRole } = useAuth();

  if (!isLoaded) {
    return <LoadingSpinner dimensions={{ x: 6, y: 6 }} />;
  }

  if (orgRole !== "org:admin") {
    return <Navigate to="/settings" replace />;
  }

  return <>{children}</>;
}
