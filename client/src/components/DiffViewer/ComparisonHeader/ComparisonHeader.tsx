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
  sourceConnectionsList: any[];
  targetConnectionsList: any[];
  isConnectionsLoading: boolean;
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

  const handleDeploy = async (userMappings: Record<number, number>) => {
    if (!sourceStr || !targetStr) {
      throw new Error(
        "Make sure both Sandbox and Prod blueprints are loaded first!",
      );
    }

    const sourceObj = JSON.parse(sourceStr);
    const targetObj = JSON.parse(targetStr);

    const applyConnectionMappings = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (Array.isArray(obj)) {
        obj.forEach(applyConnectionMappings);
      } else {
        if (obj.account && userMappings[obj.account]) {
          obj.account = userMappings[obj.account];
        }
        if (obj.connection && userMappings[obj.connection]) {
          obj.connection = userMappings[obj.connection];
        }
        if (obj.parameters) {
          Object.keys(obj.parameters).forEach((key) => {
            if (key.startsWith("__IMTCONN__")) {
              const oldId = obj.parameters[key];
              if (userMappings[oldId]) {
                obj.parameters[key] = userMappings[oldId];
              }
            }
          });
        }
        if (obj.metadata?.restore?.parameters) {
          Object.keys(obj.metadata.restore.parameters).forEach((key) => {
            if (key.startsWith("__IMTCONN__")) {
              const oldId = obj.metadata.restore.parameters[key];
              if (userMappings[oldId]) {
                obj.metadata.restore.parameters[key] = userMappings[oldId];
              }
            }
          });
        }
        Object.values(obj).forEach(applyConnectionMappings);
      }
    };

    if (Object.keys(userMappings).length > 0) {
      applyConnectionMappings(sourceObj);
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
