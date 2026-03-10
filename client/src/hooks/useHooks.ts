import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export const useHooks = (teamId?: number | null, zone?: string | null) => {
  const { getToken } = useAuth();
  const [hooks, setHooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!teamId || !zone) {
      setHooks([]);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/hooks?teamId=${teamId}&zone=${zone}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await response.json();
        setHooks(json.hooks || []);
      } catch (err) {
        console.error("Failed to load hooks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [teamId, zone, getToken]);

  return { hooks, isLoading };
};
