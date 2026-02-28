import React, { useState } from "react";
import { Blocks } from "lucide-react";
import { getAppDomain } from "../../helpers/getAppDomain";

interface AppIconProps {
  accountName: string;
  size?: number;
}

const LOGO_DEV_PUBLIC_KEY = import.meta.env.VITE_LOGO_DEV_PK;

const AppIcon: React.FC<AppIconProps> = ({ accountName, size = 20 }) => {
  const [hasError, setHasError] = useState(false);
  const domain = getAppDomain(accountName);

  if (hasError) {
    return <Blocks size={size} color="#9ca3af" />;
  }

  return (
    <img
      src={`https://img.logo.dev/${domain}?token=${LOGO_DEV_PUBLIC_KEY}&size=${size * 2}`}
      alt={`${accountName} logo`}
      width={size}
      height={size}
      style={{ borderRadius: "4px", objectFit: "contain" }}
      onError={() => setHasError(true)}
    />
  );
};

export default AppIcon;
