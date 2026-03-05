import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";

interface UseScenariosProps {
  teamId?: number | null;
  zone?: string | null;
  setJson: (val: string) => void;
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
    folderMap[folder.id] = { ...folder, scenarios: [] };
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
  teamId,
  zone,
  setJson,
  setShowErrorsOnly,
}: UseScenariosProps) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!teamId || !zone) {
      setScenarios([]);
      return;
    }

    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [scenariosRes, foldersRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/scenarios?teamId=${teamId}&zone=${zone}`,
            { headers },
          ),
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/folders?teamId=${teamId}&zone=${zone}`,
            { headers },
          ),
        ]);

        const scenariosJson = await scenariosRes.json();
        const foldersJson = await foldersRes.json();

        // 🚨 THE FIX: Make.com API hides folders under "scenarios-folders", not "folders"
        const scenarioList = scenariosJson.scenarios || [];
        const folderList =
          foldersJson["scenarios-folders"] ||
          foldersJson.scenariosFolders ||
          foldersJson.folders ||
          [];

        setScenarios(groupScenariosByFolder(scenarioList, folderList));
      } catch (err) {
        console.error("Failed to load scenarios/folders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [teamId, zone, getToken]);

  const fetchBlueprint = async (scenarioId: string) => {
    if (!scenarioId || !zone) return;

    setShowErrorsOnly(false);
    setIsLoading(true);

    try {
      const token = await getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/${scenarioId}/blueprint?zone=${zone}`,
        { headers },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to fetch blueprint");
      }

      const data = await res.json();
      const parsed =
        typeof data.blueprint === "string"
          ? JSON.parse(data.blueprint)
          : data.blueprint || data;
      const formatted = JSON.stringify(parsed, null, 2);

      setJson(formatted);
    } catch (err: any) {
      console.error("Error fetching blueprint:", err);
      alert(`Could not load blueprint: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateScenario = async (scenarioId: string, blueprint: string) => {
    if (!scenarioId || !blueprint || !zone) return;

    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/scenarios/${scenarioId}/update?zone=${zone}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ blueprint }),
        },
      );
      if (!res.ok) throw new Error("Server responded with an error");
    } catch (err) {
      console.error("Error updating scenario:", err);
      throw err;
    }
  };

  return { scenarios, isLoading, fetchBlueprint, updateScenario };
};
