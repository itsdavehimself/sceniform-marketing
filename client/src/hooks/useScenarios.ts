import { useState, useEffect } from "react";

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

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [scenariosRes, foldersRes] = await Promise.all([
          fetch("http://localhost:1337/api/scenarios"),
          fetch("http://localhost:1337/api/scenarios/folders"),
        ]);

        const scenariosData = await scenariosRes.json();
        const foldersData = await foldersRes.json();

        const scenariosList =
          scenariosData.scenarios ||
          scenariosData.items ||
          (Array.isArray(scenariosData) ? scenariosData : []);

        const foldersList =
          foldersData.scenariosFolders ||
          foldersData.items ||
          (Array.isArray(foldersData) ? foldersData : []);

        const groupedData = groupScenariosByFolder(scenariosList, foldersList);
        setScenarios(groupedData);
      } catch (err) {
        console.error("Failed to load scenarios or folders", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const fetchBlueprint = async (
    env: "prod" | "sandbox",
    scenarioId: string,
  ) => {
    if (!scenarioId) return alert("Please select a scenario first.");

    setShowErrorsOnly(false);
    setIsLoading(true);

    try {
      const res = await fetch(
        `http://localhost:1337/api/scenarios/${scenarioId}/blueprint`,
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
      alert("Could not fetch the blueprint. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateScenario = async (scenarioId: string, blueprint: string) => {
    if (!scenarioId || !blueprint) return alert("Missing ID or Blueprint data");

    try {
      const res = await fetch(
        `http://localhost:1337/api/scenarios/${scenarioId}/update`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blueprint: blueprint }),
        },
      );

      if (!res.ok) throw new Error("Server responded with an error");

      const data = await res.json();
    } catch (err) {
      console.error("Error updating scenario:", err);
    }
  };

  return { scenarios, isLoading, fetchBlueprint, updateScenario };
};
