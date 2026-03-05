import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export const useSavedApiKeys = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [savedKeys, setSavedKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchSavedKeys = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (res.ok) {
          const data = await res.json();
          setSavedKeys(data.connections);
        }
      } catch (err) {
        console.error("Failed to fetch saved connections in DB:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedKeys();
  }, [isLoaded, isSignedIn, getToken]);

  return { savedKeys, isLoading };
};
