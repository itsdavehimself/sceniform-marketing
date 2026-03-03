import { useState, useEffect } from "react";
import { useMakeContext } from "../context/MakeContext";
import { useAuth } from "@clerk/clerk-react";

interface UseScenariosProps {
  setProdJson: (val: string) => void;
  setSandboxJson: (val: string) => void;
  setShowErrorsOnly: (val: boolean) => void;
}

const groupScenariosByFolder = (scenarios: any[], folders: any[]) => {
  const folderMap: Record<string, any> = {};

  folderMap["uncategorized"] = {
    id: null,
    name: "Uncategorized",
    scenarios: [],
  };

  folders.forEach((folder) => {
    folderMap[folder.id] = {
      ...folder,
      scenarios: [],
    };
  });

  scenarios.forEach((scenario) => {
    const folderId = scenario.folderId;
    if (folderId && folderMap[folderId]) {
      folderMap[folderId].scenarios.push(scenario);
    } else {
      folderMap["uncategorized"].scenarios.push(scenario);
    }
  });
  return Object.values(folderMap);
};

export const useScenarios = ({
  setProdJson,
  setSandboxJson,
  setShowErrorsOnly,
}: UseScenariosProps) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { activeTeam, activeOrg } = useMakeContext();
  const { getToken } = useAuth();

  useEffect(() => {
    if (!activeTeam || !activeOrg) return;

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const queryParams = `?teamId=${activeTeam.id}&zone=${activeOrg.zone}`;
        const headers = { Authorization: `Bearer ${token}` };

        const [scenariosRes, foldersRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/scenarios${queryParams}`,
            { headers },
          ),
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/folders${queryParams}`,
            { headers },
          ),
        ]);

        const scenariosData = await scenariosRes.json();
        const foldersData = await foldersRes.json();

        const scenariosList =
          scenariosData.scenarios || scenariosData.items || [];
        const foldersList =
          foldersData.scenariosFolders || foldersData.items || [];

        const groupedData = groupScenariosByFolder(scenariosList, foldersList);
        setScenarios(groupedData);
      } catch (err) {
        console.error("Failed to load scenarios or folders", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [activeTeam, activeOrg, getToken]);

  const fetchBlueprint = async (
    env: "prod" | "sandbox",
    scenarioId: string,
  ) => {
    if (!scenarioId || !activeOrg) return;

    setShowErrorsOnly(false);
    setIsLoading(true);

    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/${scenarioId}/blueprint?zone=${activeOrg.zone}`,
        { headers },
      );
      const data = await res.json();
      const parsed =
        typeof data.blueprint === "string"
          ? JSON.parse(data.blueprint)
          : data.blueprint || data;
      const formatted = JSON.stringify(parsed, null, 2);

      if (env === "prod") setProdJson(formatted);
      else setSandboxJson(formatted);
    } catch (err) {
      console.error("Error fetching blueprint:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateScenario = async (scenarioId: string, blueprint: string) => {
    if (!scenarioId || !blueprint || !activeOrg) return;

    try {
      const token = await getToken();
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/${scenarioId}/update?zone=${activeOrg.zone}`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ blueprint: blueprint }),
        },
      );
      if (!res.ok) throw new Error("Server responded with an error");
    } catch (err) {
      console.error("Error updating scenario:", err);
    }
  };

  return { scenarios, isLoading, fetchBlueprint, updateScenario };
};
