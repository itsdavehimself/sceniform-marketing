import React, { useState } from "react";
import ActionButton from "../../ActionButton/ActionButton";
import styles from "./DeploymentModal.module.scss";
import { useConnections } from "../../../hooks/useConnections";
import { useDeploymentMappings } from "../../../hooks/useDeploymentMappings";
import MappingRow from "./MappingRow/MappingRow";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

interface DeploymentModalProps {
  isReverse: boolean;
  sourceJson: string;
  targetJson: string;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeploy: (mappings: Record<number, number>) => void;
  diffReport: any;
  onDeploySuccess: () => void;
}

type LogEntry = {
  text: string;
  type: "info" | "success" | "added" | "removed" | "modified";
};

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isReverse,
  sourceJson,
  targetJson,
  setIsModalOpen,
  handleDeploy,
  diffReport,
  onDeploySuccess,
}) => {
  const { connections, isLoading } = useConnections();
  const { sourceConnections, mappings, autoMappings, handleMappingChange } =
    useDeploymentMappings(sourceJson, targetJson);

  const [deployState, setDeployState] = useState<
    "idle" | "deploying" | "success"
  >("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const isDeployReady = sourceConnections.every((conn) => !!mappings[conn.id]);

  const executeDeployment = async () => {
    if (!isDeployReady) return;

    let addedCount = diffReport?.summary?.added || 0;
    let removedCount = diffReport?.summary?.removed || 0;
    let modifiedCount = diffReport?.summary?.modified || 0;

    if (diffReport?.changes && !diffReport.summary) {
      diffReport.changes.forEach((c: any) => {
        if (c.type === "ADDED") addedCount++;
        if (c.type === "REMOVED") removedCount++;
        if (c.type === "MODIFIED" || c.type === "REPLACEMENT") modifiedCount++;
      });
    }

    setDeployState("deploying");
    setLogs([{ text: "> Initializing deployment sequence...", type: "info" }]);

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    await sleep(600);
    setLogs((prev) => [
      ...prev,
      { text: "> Validating blueprint structure...", type: "info" },
    ]);

    // 4. DYNAMIC LOGS: Only show them if changes actually exist!
    if (addedCount > 0) {
      await sleep(500);
      setLogs((prev) => [
        ...prev,
        {
          text: `> + Adding ${addedCount} module${addedCount > 1 ? "s" : ""}...`,
          type: "added",
        },
      ]);
    }

    if (removedCount > 0) {
      await sleep(500);
      setLogs((prev) => [
        ...prev,
        {
          text: `> - Removing ${removedCount} module${removedCount > 1 ? "s" : ""}...`,
          type: "removed",
        },
      ]);
    }

    if (modifiedCount > 0) {
      await sleep(500);
      setLogs((prev) => [
        ...prev,
        {
          text: `> ~ Updating ${modifiedCount} module${modifiedCount > 1 ? "s" : ""}...`,
          type: "modified",
        },
      ]);
    }

    await sleep(800);
    setLogs((prev) => [
      ...prev,
      { text: "> Applying connection mappings...", type: "info" },
    ]);

    await sleep(700);
    setLogs((prev) => [
      ...prev,
      { text: "> Packaging scenario payload...", type: "info" },
    ]);

    await sleep(900);
    setLogs((prev) => [
      ...prev,
      { text: `> Pushing to target environment...`, type: "info" },
    ]);

    await sleep(1000);
    setLogs((prev) => [
      ...prev,
      { text: "✓ Deployment successful! 🚀", type: "success" },
    ]);

    await sleep(1200);
    handleDeploy(mappings);
    setDeployState("success");
  };

  return (
    <div className={styles.deploymentModal}>
      {deployState === "idle" && (
        <>
          <div className={styles.modalHeaderInfo}>
            <p className={styles.helperText}>
              To prevent overwriting live credentials, map your{" "}
              <strong>{isReverse ? "Production" : "Sandbox"}</strong>{" "}
              connections to the target environment. We've auto-matched existing
              connections for you.
            </p>
          </div>

          {isLoading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner dimensions={{ x: 6, y: 6 }} />
            </div>
          ) : (
            <div className={styles.mappingsContainer}>
              {sourceConnections.map((conn) => (
                <MappingRow
                  key={conn.id}
                  conn={conn}
                  connections={connections}
                  currentMapping={mappings[conn.id] || ""}
                  isAutoMapped={
                    autoMappings[conn.id] !== undefined &&
                    autoMappings[conn.id] === mappings[conn.id]
                  }
                  onMappingChange={handleMappingChange}
                />
              ))}
            </div>
          )}

          {sourceConnections.length === 0 && !isLoading && (
            <p className={styles.modalHeaderInfo}>
              No connections detected in this blueprint.
            </p>
          )}
        </>
      )}

      {deployState !== "idle" && (
        <div className={styles.terminalContainer}>
          <div className={styles.terminalHeader}>
            <div className={styles.terminalDots}>
              <span className={styles.dotRed}></span>
              <span className={styles.dotYellow}></span>
              <span className={styles.dotGreen}></span>
            </div>
            <span className={styles.terminalTitle}>
              bash - Deploying to {!isReverse ? "Production" : "Sandbox"}
            </span>
          </div>
          <div className={styles.terminalBody}>
            {logs.map((log, index) => {
              let colorClass = "";
              if (log.type === "success") colorClass = styles.logSuccess;
              if (log.type === "added") colorClass = styles.logAdded;
              if (log.type === "removed") colorClass = styles.logRemoved;
              if (log.type === "modified") colorClass = styles.logModified;

              return (
                <div key={index} className={`${styles.logLine} ${colorClass}`}>
                  {log.text}
                </div>
              );
            })}
            {deployState === "deploying" && (
              <div className={styles.cursor}></div>
            )}
          </div>
        </div>
      )}

      <div className={styles.buttonContainer}>
        {deployState !== "success" && (
          <ActionButton
            title="Cancel"
            variant={deployState === "idle" ? "secondary" : "disabled"}
            onClick={() => {
              if (deployState === "idle") setIsModalOpen(false);
            }}
          />
        )}

        <ActionButton
          title={
            deployState === "idle"
              ? "Deploy"
              : deployState === "deploying"
                ? "Deploying..."
                : "Close"
          }
          variant={
            deployState === "idle" && isDeployReady
              ? "primary"
              : deployState === "success"
                ? "primary"
                : "disabled"
          }
          onClick={() => {
            if (deployState === "idle") executeDeployment();
            if (deployState === "success") {
              setIsModalOpen(false);
              onDeploySuccess();
            }
          }}
        />
      </div>
    </div>
  );
};

export default DeploymentModal;
