import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

export const useConnections = (
  teamId?: number | null,
  zone?: string | null,
) => {
  const { getToken } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!teamId || !zone) {
      setConnections([]);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/connections?teamId=${teamId}&zone=${zone}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const json = await response.json();
        setConnections(json.connections || []);
      } catch (err) {
        console.error("Failed to load connections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [teamId, zone, getToken]);

  return { connections, isLoading };
};
