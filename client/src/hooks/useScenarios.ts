import { useState, useEffect } from "react";

interface UseScenariosProps {
  setProdJson: (val: string) => void;
  setSandboxJson: (val: string) => void;
  setShowErrorsOnly: (val: boolean) => void;
}

export const useScenarios = ({
  setProdJson,
  setSandboxJson,
  setShowErrorsOnly,
}: UseScenariosProps) => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch the list of scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await fetch("http://localhost:1337/api/scenarios");
        const data = await res.json();
        const list =
          data.scenarios || data.items || (Array.isArray(data) ? data : []);
        setScenarios(list);
      } catch (err) {
        console.error("Failed to load scenarios list", err);
      }
    };
    fetchScenarios();
  }, []);

  // Fetch a specific blueprint and update the appropriate JSON state
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
      alert("Update successful!");
      console.log(data);
    } catch (err) {
      console.error("Error updating scenario:", err);
      alert("Update failed.");
    }
  };

  return { scenarios, isLoading, fetchBlueprint, updateScenario };
};
