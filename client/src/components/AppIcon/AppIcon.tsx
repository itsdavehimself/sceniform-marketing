import React, { useState, useEffect } from "react";
import { Blocks, Radio } from "lucide-react";

interface AppIconProps {
  accountName?: string;
  size?: number;
  type?: "connection" | "hook";
}

const LOGO_DEV_PUBLIC_KEY = import.meta.env.VITE_LOGO_DEV_PK;
const domainCache = new Map<string, Promise<string | null>>();

const AppIcon: React.FC<AppIconProps> = ({
  accountName,
  size = 20,
  type = "connection",
}) => {
  const [domain, setDomain] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(type === "connection");

  useEffect(() => {
    if (type === "hook" || !accountName) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDomain = async () => {
      try {
        if (!domainCache.has(accountName)) {
          const fetchPromise = fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/AppDomain/${encodeURIComponent(accountName)}`,
          )
            .then((res) => {
              if (!res.ok) throw new Error("Network error");
              return res.json();
            })
            .then((data) => data.domain || null)
            .catch(() => null);

          domainCache.set(accountName, fetchPromise);
        }

        const resolvedDomain = await domainCache.get(accountName);

        if (!isMounted) return;

        if (resolvedDomain) {
          setDomain(resolvedDomain);
        } else {
          setHasError(true);
        }
      } catch (error) {
        if (isMounted) setHasError(true);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDomain();

    return () => {
      isMounted = false;
    };
  }, [accountName, type]);

  // If it's a hook, just return a generic Radio/Antenna icon
  if (type === "hook") {
    return <Radio size={size} color="#6366f1" />;
  }

  if (isLoading) {
    return <Blocks size={size} color="#e5e7eb" className="animate-pulse" />;
  }

  if (hasError || !domain) {
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
