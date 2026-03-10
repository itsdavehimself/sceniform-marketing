import { useState, useMemo } from "react";
import { extractConnectionId } from "../helpers/extractConnectionId";

export const useDeploymentMappings = (
  sourceJson: string,
  targetJson: string,
) => {
  // --- 1. EXTRACT SOURCE DEPENDENCIES ---
  const { sourceConnections, sourceHooks } = useMemo(() => {
    const conns = new Map<number, string>();
    const hooks = new Map<number, string>();

    if (!sourceJson) return { sourceConnections: [], sourceHooks: [] };

    try {
      const parsed = JSON.parse(sourceJson);

      const extract = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach(extract);
        } else {
          // Extract Connections
          const connId = extractConnectionId(obj);
          if (connId) {
            const moduleName =
              obj.metadata?.designer?.name || obj.module || "Unknown App";
            conns.set(connId, moduleName);
          }

          // Extract Webhooks/Mailhooks
          if (obj.module?.startsWith("gateway:") && obj.parameters?.hook) {
            const moduleName = obj.metadata?.designer?.name || obj.module;
            hooks.set(obj.parameters.hook, moduleName);
          }

          Object.values(obj).forEach(extract);
        }
      };

      extract(parsed);
    } catch (e) {
      console.error("Failed to parse source JSON", e);
    }

    return {
      sourceConnections: Array.from(conns.entries()).map(([id, app]) => ({
        id,
        app,
      })),
      sourceHooks: Array.from(hooks.entries()).map(([id, app]) => ({
        id,
        app,
      })),
    };
  }, [sourceJson]);

  // --- 2. AUTO-MAPPING LOGIC ---
  const { autoConnMappings, autoHookMappings } = useMemo(() => {
    if (!targetJson || !sourceJson)
      return { autoConnMappings: {}, autoHookMappings: {} };

    const computedConns: Record<number, number> = {};
    const computedHooks: Record<number, number> = {};

    try {
      const targetParsed = JSON.parse(targetJson);
      const sourceParsed = JSON.parse(sourceJson);

      const buildModuleMaps = (
        obj: any,
        connMap: Map<number, number>,
        hookMap: Map<number, number>,
      ) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach((item) => buildModuleMaps(item, connMap, hookMap));
        } else {
          if (obj.id !== undefined) {
            const connId = extractConnectionId(obj);
            if (connId) connMap.set(obj.id, connId);

            if (obj.module?.startsWith("gateway:") && obj.parameters?.hook) {
              hookMap.set(obj.id, obj.parameters.hook);
            }
          }
          Object.values(obj).forEach((val) =>
            buildModuleMaps(val, connMap, hookMap),
          );
        }
      };

      const targetConns = new Map<number, number>();
      const targetHooks = new Map<number, number>();
      buildModuleMaps(targetParsed, targetConns, targetHooks);

      const sourceConns = new Map<number, number>();
      const sourceHooksMap = new Map<number, number>();
      buildModuleMaps(sourceParsed, sourceConns, sourceHooksMap);

      // Match by identical Module ID
      sourceConns.forEach((sourceConnId, moduleId) => {
        if (targetConns.has(moduleId))
          computedConns[sourceConnId] = targetConns.get(moduleId)!;
      });

      sourceHooksMap.forEach((sourceHookId, moduleId) => {
        if (targetHooks.has(moduleId))
          computedHooks[sourceHookId] = targetHooks.get(moduleId)!;
      });
    } catch (e) {
      console.error("Auto-mapping failed", e);
    }

    return { autoConnMappings: computedConns, autoHookMappings: computedHooks };
  }, [sourceJson, targetJson]);

  // --- 3. USER OVERRIDES ---
  const [userConnOverrides, setUserConnOverrides] = useState<
    Record<number, number>
  >({});
  const [userHookOverrides, setUserHookOverrides] = useState<
    Record<number, number>
  >({});

  // --- 4. FINAL MERGED MAPPINGS ---
  const finalConnMappings = useMemo(
    () => ({ ...autoConnMappings, ...userConnOverrides }),
    [autoConnMappings, userConnOverrides],
  );
  const finalHookMappings = useMemo(
    () => ({ ...autoHookMappings, ...userHookOverrides }),
    [autoHookMappings, userHookOverrides],
  );

  return {
    sourceConnections,
    sourceHooks,
    connMappings: finalConnMappings,
    hookMappings: finalHookMappings,
    autoConnMappings,
    autoHookMappings,
    handleConnMappingChange: (sId: number, tId: number) =>
      setUserConnOverrides((p) => ({ ...p, [sId]: tId })),
    handleHookMappingChange: (sId: number, tId: number) =>
      setUserHookOverrides((p) => ({ ...p, [sId]: tId })),
  };
};
