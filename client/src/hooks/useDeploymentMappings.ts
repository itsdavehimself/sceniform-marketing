import { useState, useMemo } from "react";
import { extractConnectionId } from "../helpers/extractConnectionId"; // Assuming you saved the helper here!

export const useDeploymentMappings = (
  sourceJson: string,
  targetJson: string,
) => {
  // 1. Find all unique connections in the Sandbox blueprint
  const sourceConnections = useMemo(() => {
    if (!sourceJson) return [];
    try {
      const parsed = JSON.parse(sourceJson);
      const found = new Map<number, string>();

      const extract = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach(extract);
        } else {
          const connId = extractConnectionId(obj);
          if (connId) {
            const moduleName =
              obj.metadata?.designer?.name || obj.module || "Unknown App";
            found.set(connId, moduleName);
          }
          Object.values(obj).forEach(extract);
        }
      };

      extract(parsed);
      return Array.from(found.entries()).map(([id, app]) => ({ id, app }));
    } catch (e) {
      console.error("Failed to parse source JSON", e);
      return [];
    }
  }, [sourceJson]);

  // 2. Calculate the defaults (NO useEffect, purely derived data!)
  const autoMappings = useMemo(() => {
    if (!targetJson || !sourceJson) return {};
    try {
      const targetParsed = JSON.parse(targetJson);
      const sourceParsed = JSON.parse(sourceJson);
      const computedMappings: Record<number, number> = {};

      const buildModuleConnectionMap = (obj: any, map: Map<number, number>) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach((item) => buildModuleConnectionMap(item, map));
        } else {
          const connId = extractConnectionId(obj);
          if (obj.id !== undefined && connId) map.set(obj.id, connId);
          Object.values(obj).forEach((val) =>
            buildModuleConnectionMap(val, map),
          );
        }
      };

      const targetModuleConnections = new Map<number, number>();
      buildModuleConnectionMap(targetParsed, targetModuleConnections);

      const sourceModuleConnections = new Map<number, number>();
      buildModuleConnectionMap(sourceParsed, sourceModuleConnections);

      sourceModuleConnections.forEach((sourceConnId, moduleId) => {
        if (targetModuleConnections.has(moduleId)) {
          computedMappings[sourceConnId] =
            targetModuleConnections.get(moduleId)!;
        }
      });

      return computedMappings;
    } catch (e) {
      console.error("Auto-mapping failed", e);
      return {};
    }
  }, [sourceJson, targetJson]);

  // 3. Only store what the user MANUALLY changes
  const [userOverrides, setUserOverrides] = useState<Record<number, number>>(
    {},
  );

  // 4. Merge them together for the final output
  const finalMappings = useMemo(() => {
    return { ...autoMappings, ...userOverrides };
  }, [autoMappings, userOverrides]);

  const handleMappingChange = (sourceId: number, targetId: number) => {
    setUserOverrides((prev) => ({ ...prev, [sourceId]: targetId }));
  };

  return {
    sourceConnections,
    mappings: finalMappings,
    autoMappings, // Exposing this so the UI knows if a field was auto-mapped!
    handleMappingChange,
  };
};
