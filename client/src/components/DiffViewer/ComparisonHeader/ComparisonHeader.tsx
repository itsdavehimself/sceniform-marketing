import React from "react";
import styles from "./ComparisonHeader.module.scss";
import ActionButton from "../../ActionButton/ActionButton";

interface ComparisonHeaderProps {
  updateScenario: (scenarioId: string, blueprint: string) => void;
  currentProdId: string;
  currentSandboxId: string;
  prodJson: string;
  sandboxJson: string;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  isReverse: boolean;
  setIsReverse: (val: boolean) => void;
  ignoreScenarioName: boolean;
  ignoreConnections: boolean;
  ignoreModuleNames: boolean;
  diffReport: any;
}

const ComparisonHeader: React.FC<ComparisonHeaderProps> = ({
  updateScenario,
  currentProdId,
  currentSandboxId,
  prodJson,
  sandboxJson,
  isDarkMode,
  setIsDarkMode,
  isReverse,
  setIsReverse,
  ignoreScenarioName,
  ignoreConnections,
  ignoreModuleNames,
  diffReport,
}) => {
  const handleDeploy = () => {
    // 1. Define who is who based on the direction
    const sourceStr = isReverse ? prodJson : sandboxJson;
    const targetStr = isReverse ? sandboxJson : prodJson;
    const targetId = isReverse ? currentSandboxId : currentProdId;

    if (!sourceStr || !targetStr) {
      alert("Make sure both Sandbox and Prod blueprints are loaded first!");
      return;
    }

    try {
      // 2. Parse them into manageable objects
      const sourceObj = JSON.parse(sourceStr);
      const targetObj = JSON.parse(targetStr);

      // ==========================================
      // 3. THE TRANSFORM ENGINE (Apply Filters)
      // ==========================================

      // Filter 1: Retain target's Scenario Name
      if (ignoreScenarioName) {
        if (targetObj.name) {
          sourceObj.name = targetObj.name;
        }
      }

      // Filter 2: Ignore Module Renames
      if (ignoreModuleNames) {
        // Step A: Build a dictionary of Target Module IDs -> Names
        const targetNamesMap: Record<string | number, string> = {};

        const extractNames = (obj: any) => {
          if (!obj || typeof obj !== "object") return;

          if (Array.isArray(obj)) {
            obj.forEach(extractNames);
          } else {
            // Check if this object is a module with an ID and a designer name
            if (obj.id !== undefined && obj.metadata?.designer?.name) {
              targetNamesMap[obj.id] = obj.metadata.designer.name;
            }
            // Keep digging for nested flows (Routers, Error Handlers)
            Object.values(obj).forEach(extractNames);
          }
        };

        // Step B: Inject those names back into the Source Object
        const injectNames = (obj: any) => {
          if (!obj || typeof obj !== "object") return;

          if (Array.isArray(obj)) {
            obj.forEach(injectNames);
          } else {
            // If we find a module ID that exists in our target map, overwrite the name
            if (obj.id !== undefined && targetNamesMap[obj.id] !== undefined) {
              // Ensure the metadata.designer structure exists before writing to it
              if (!obj.metadata) obj.metadata = {};
              if (!obj.metadata.designer) obj.metadata.designer = {};

              obj.metadata.designer.name = targetNamesMap[obj.id];
            }
            // Keep digging
            Object.values(obj).forEach(injectNames);
          }
        };

        // Execute the extraction and injection
        extractNames(targetObj);
        injectNames(sourceObj);

        console.log("Preserved Module Names:", targetNamesMap);
      }

      if (ignoreConnections) {
        // Step A: Build a dictionary of Target Module IDs -> Connection Data
        const targetConnectionsMap: Record<string | number, any> = {};

        const extractConnections = (obj: any) => {
          if (!obj || typeof obj !== "object") return;

          if (Array.isArray(obj)) {
            obj.forEach(extractConnections);
          } else {
            // Check if this object is a module (has an ID)
            if (obj.id !== undefined) {
              const connData: any = {
                parameters: {},
                restoreParameters: {},
                account: obj.account,
                connection: obj.connection,
              };

              let hasConnection = false;

              // 1. Hunt down the actual functional connection ID(s)
              if (obj.parameters) {
                Object.keys(obj.parameters).forEach((key) => {
                  if (key.startsWith("__IMTCONN__")) {
                    connData.parameters[key] = obj.parameters[key];
                    hasConnection = true;
                  }
                });
              }

              // 2. Hunt down the visual label data for the Make UI
              if (obj.metadata?.restore?.parameters) {
                Object.keys(obj.metadata.restore.parameters).forEach((key) => {
                  if (key.startsWith("__IMTCONN__")) {
                    connData.restoreParameters[key] =
                      obj.metadata.restore.parameters[key];
                  }
                });
              }

              // Only save if we actually found connection data
              if (connData.account || connData.connection || hasConnection) {
                targetConnectionsMap[obj.id] = connData;
              }
            }
            // Keep digging
            Object.values(obj).forEach(extractConnections);
          }
        };

        // Step B: Inject those connections back into the Source Object
        const injectConnections = (obj: any) => {
          if (!obj || typeof obj !== "object") return;

          if (Array.isArray(obj)) {
            obj.forEach(injectConnections);
          } else {
            // If we find a module ID that exists in our target connections map
            if (obj.id !== undefined && targetConnectionsMap[obj.id]) {
              const savedAuth = targetConnectionsMap[obj.id];

              // 1. Restore the functional connection ID
              if (Object.keys(savedAuth.parameters).length > 0) {
                if (!obj.parameters) obj.parameters = {};
                Object.assign(obj.parameters, savedAuth.parameters);
              }

              // 2. Restore the UI label data
              if (Object.keys(savedAuth.restoreParameters).length > 0) {
                if (!obj.metadata) obj.metadata = {};
                if (!obj.metadata.restore) obj.metadata.restore = {};
                if (!obj.metadata.restore.parameters)
                  obj.metadata.restore.parameters = {};
                Object.assign(
                  obj.metadata.restore.parameters,
                  savedAuth.restoreParameters,
                );
              }

              // 3. Restore legacy properties (just in case)
              if (savedAuth.account !== undefined)
                obj.account = savedAuth.account;
              if (savedAuth.connection !== undefined)
                obj.connection = savedAuth.connection;
            }
            // Keep digging
            Object.values(obj).forEach(injectConnections);
          }
        };

        // Execute extraction and injection
        extractConnections(targetObj);
        injectConnections(sourceObj);

        console.log("Preserved Connections:", targetConnectionsMap);
      }

      // 4. Send the transformed blueprint!
      const finalPayloadStr = JSON.stringify(sourceObj);
      updateScenario(targetId, finalPayloadStr);
    } catch (error) {
      console.error("Failed to parse JSON for transformation:", error);
      alert("Could not process the blueprints. Check console.");
    }
  };

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Deployment Console</h1>
      </div>

      <div className={styles.actions}>
        <ActionButton
          title={isReverse ? "Base: Sandbox" : "Base: Production"}
          onClick={() => setIsReverse(!isReverse)}
          variant="secondary"
        />
        <ActionButton
          title={isReverse ? "Rollback to Sandbox" : "Push to Production"}
          onClick={handleDeploy}
          variant={!diffReport ? "disabled" : "primary"}
        />
      </div>
    </header>
  );
};

export default ComparisonHeader;
