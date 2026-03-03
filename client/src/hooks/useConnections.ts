import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMakeContext } from "../context/MakeContext";

export const useConnections = () => {
  const { getToken } = useAuth();
  const { activeTeam, activeOrg } = useMakeContext();
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!activeTeam || !activeOrg) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/connections?teamId=${activeTeam.id}&zone=${activeOrg.zone}`,
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
  }, [activeTeam, activeOrg, getToken]);

  return { connections, isLoading };
};
