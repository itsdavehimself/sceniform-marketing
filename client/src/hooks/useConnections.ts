import { useState, useEffect } from "react";

interface UseConnectionsProps {}

export const useConnections = (props?: UseConnectionsProps) => {
  const [connections, setConnections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "http://localhost:1337/api/scenarios/connections",
        );
        const json = await response.json();
        console.log(json);
        setConnections(json.connections);
      } catch (err) {
        console.error("Failed to load connections:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  return { connections, isLoading };
};
