import React, { useState } from "react";
import styles from "./ComparisonHeader.module.scss";
import ActionButton from "../../ActionButton/ActionButton";
import Modal from "../../Modal/Modal";
import DeploymentModal from "../DeploymentModal/DeploymentModal";

interface ComparisonHeaderProps {
  updateScenario: (scenarioId: string, blueprint: string) => Promise<void>;
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
  onDeploySuccess: () => void;
  // Connections
  sourceConnectionsList: any[];
  targetConnectionsList: any[];
  isConnectionsLoading: boolean;
  // Hooks
  sourceHooksList: any[];
  targetHooksList: any[];
  isHooksLoading: boolean;
  // Meta
  baseZone?: string;
  targetZone?: string;
  baseTeamId?: number;
  targetTeamId?: number;
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
  onDeploySuccess,
  sourceConnectionsList,
  targetConnectionsList,
  isConnectionsLoading,
  sourceHooksList,
  targetHooksList,
  isHooksLoading,
  baseZone,
  targetZone,
  baseTeamId,
  targetTeamId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const sourceStr = isReverse ? prodJson : sandboxJson;
  const targetStr = isReverse ? sandboxJson : prodJson;
  const targetId = isReverse ? currentSandboxId : currentProdId;

  const activeTargetZone = isReverse ? targetZone : baseZone;
  const activeTargetTeamId = isReverse ? targetTeamId : baseTeamId;

  const handleDeploy = async (userMappings: {
    connections: Record<number, number>;
    hooks: Record<number, number>;
  }) => {
    if (!sourceStr || !targetStr) {
      throw new Error(
        "Make sure both Sandbox and Prod blueprints are loaded first!",
      );
    }

    const sourceObj = JSON.parse(sourceStr);
    const targetObj = JSON.parse(targetStr);

    const applyMappings = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) {
        obj.forEach(applyMappings);
      } else {
        // --- Swap Connections ---
        if (obj.account && userMappings.connections[obj.account]) {
          obj.account = userMappings.connections[obj.account];
        }
        if (obj.connection && userMappings.connections[obj.connection]) {
          obj.connection = userMappings.connections[obj.connection];
        }

        if (obj.parameters) {
          Object.keys(obj.parameters).forEach((key) => {
            if (key.startsWith("__IMTCONN__")) {
              const oldId = obj.parameters[key];
              if (userMappings.connections[oldId]) {
                obj.parameters[key] = userMappings.connections[oldId];
              }
            }
          });

          // --- Swap Hooks ---
          if (obj.module?.startsWith("gateway:") && obj.parameters.hook) {
            const oldHookId = obj.parameters.hook;
            if (userMappings.hooks[oldHookId]) {
              obj.parameters.hook = userMappings.hooks[oldHookId];
            }
          }
        }

        if (obj.metadata?.restore?.parameters) {
          Object.keys(obj.metadata.restore.parameters).forEach((key) => {
            if (key.startsWith("__IMTCONN__")) {
              const oldId = obj.metadata.restore.parameters[key];
              if (userMappings.connections[oldId]) {
                obj.metadata.restore.parameters[key] =
                  userMappings.connections[oldId];
              }
            }
          });
        }

        Object.values(obj).forEach(applyMappings);
      }
    };

    if (
      Object.keys(userMappings.connections).length > 0 ||
      Object.keys(userMappings.hooks).length > 0
    ) {
      applyMappings(sourceObj);
    }

    if (ignoreScenarioName && targetObj.name) {
      sourceObj.name = targetObj.name;
    }

    if (ignoreModuleNames) {
      const targetNamesMap: Record<string | number, string> = {};
      const extractNames = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach(extractNames);
        } else {
          if (obj.id !== undefined && obj.metadata?.designer?.name) {
            targetNamesMap[obj.id] = obj.metadata.designer.name;
          }
          Object.values(obj).forEach(extractNames);
        }
      };

      const injectNames = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (Array.isArray(obj)) {
          obj.forEach(injectNames);
        } else {
          if (obj.id !== undefined && targetNamesMap[obj.id] !== undefined) {
            if (!obj.metadata) obj.metadata = {};
            if (!obj.metadata.designer) obj.metadata.designer = {};
            obj.metadata.designer.name = targetNamesMap[obj.id];
          }
          Object.values(obj).forEach(injectNames);
        }
      };

      extractNames(targetObj);
      injectNames(sourceObj);
    }
    const finalPayloadStr = JSON.stringify(sourceObj);
    await updateScenario(targetId, finalPayloadStr);
  };

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>Deployment Console</h1>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          !isReverse ? "Deploying to Production" : "Rolling back to Sandbox"
        }
        size="lg"
      >
        <DeploymentModal
          isReverse={isReverse}
          sourceJson={sourceStr}
          targetJson={targetStr}
          setIsModalOpen={setIsModalOpen}
          handleDeploy={handleDeploy}
          diffReport={diffReport}
          onDeploySuccess={onDeploySuccess}
          sourceConnectionsList={
            isReverse ? targetConnectionsList : sourceConnectionsList
          }
          targetConnectionsList={
            isReverse ? sourceConnectionsList : targetConnectionsList
          }
          isConnectionsLoading={isConnectionsLoading}
          sourceHooksList={isReverse ? targetHooksList : sourceHooksList}
          targetHooksList={isReverse ? sourceHooksList : targetHooksList}
          isHooksLoading={isHooksLoading}
          targetScenarioId={targetId}
          targetZone={activeTargetZone}
          targetTeamId={activeTargetTeamId}
        />
      </Modal>

      <div className={styles.actions}>
        <ActionButton
          title={isReverse ? "Base: Sandbox" : "Base: Production"}
          onClick={() => setIsReverse(!isReverse)}
          variant="secondary"
        />
        <ActionButton
          title={isReverse ? "Rollback to Sandbox" : "Push to Production"}
          onClick={() => setIsModalOpen(true)}
          disabled={!diffReport}
          variant="primary"
        />
      </div>
    </header>
  );
};

export default ComparisonHeader;
