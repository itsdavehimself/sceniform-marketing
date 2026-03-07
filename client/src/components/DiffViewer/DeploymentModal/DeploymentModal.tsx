import React, { useState } from "react";
import ActionButton from "../../ActionButton/ActionButton";
import styles from "./DeploymentModal.module.scss";
import { useDeploymentMappings } from "../../../hooks/useDeploymentMappings";
import MappingRow from "./MappingRow/MappingRow";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

interface DeploymentModalProps {
  isReverse: boolean;
  sourceJson: string;
  targetJson: string;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeploy: (mappings: Record<number, number>) => Promise<void>;
  diffReport: any;
  onDeploySuccess: () => void;
  sourceConnectionsList: any[];
  targetConnectionsList: any[];
  isConnectionsLoading: boolean;
  targetScenarioId?: string;
  targetZone?: string;
  targetTeamId?: number;
}

type LogEntry = {
  text: string;
  type:
    | "info"
    | "success"
    | "added"
    | "removed"
    | "modified"
    | "link"
    | "error";
  url?: string;
};

const DeploymentModal: React.FC<DeploymentModalProps> = ({
  isReverse,
  sourceJson,
  targetJson,
  setIsModalOpen,
  handleDeploy,
  diffReport,
  onDeploySuccess,
  sourceConnectionsList,
  targetConnectionsList,
  isConnectionsLoading,
  targetScenarioId,
  targetZone,
  targetTeamId,
}) => {
  const { sourceConnections, mappings, autoMappings, handleMappingChange } =
    useDeploymentMappings(sourceJson, targetJson);

  const [deployState, setDeployState] = useState<
    "idle" | "deploying" | "success" | "error"
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

    try {
      await handleDeploy(mappings);

      await sleep(400);
      setLogs((prev) => [
        ...prev,
        { text: "✓ Deployment successful! 🚀", type: "success" },
      ]);

      if (targetScenarioId && targetZone && targetTeamId) {
        await sleep(400);
        setLogs((prev) => [
          ...prev,
          {
            text: "> Open live scenario in Make.com ↗",
            type: "link",
            url: `https://${targetZone}/${targetTeamId}/scenarios/${targetScenarioId}/edit`,
          },
        ]);
      }

      await sleep(1200);
      setDeployState("success");
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        {
          text: `❌ Deployment failed: ${err.message || "Unknown API Error"}`,
          type: "error",
        },
      ]);
      setDeployState("error");
    }
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

          {isConnectionsLoading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner dimensions={{ x: 6, y: 6 }} />
            </div>
          ) : (
            <div className={styles.mappingsContainer}>
              {sourceConnections.map((conn) => (
                <MappingRow
                  key={conn.id}
                  conn={conn}
                  sourceConnections={sourceConnectionsList}
                  targetConnections={targetConnectionsList}
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

          {sourceConnections.length === 0 && !isConnectionsLoading && (
            <div className={styles.noConnectionsContainer}>
              <p className={styles.modalHeaderInfo}>
                No connections detected in this blueprint.
              </p>
            </div>
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
              if (log.type === "link") {
                return (
                  <div key={index} className={styles.logLine}>
                    <a
                      href={log.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "#58a6ff",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      {log.text}
                    </a>
                  </div>
                );
              }

              let colorClass = "";
              if (log.type === "success") colorClass = styles.logSuccess;
              if (log.type === "added") colorClass = styles.logAdded;
              if (log.type === "removed") colorClass = styles.logRemoved;
              if (log.type === "modified") colorClass = styles.logModified;
              if (log.type === "error") colorClass = styles.logError;

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
        {deployState === "idle" && (
          <ActionButton
            title="Cancel"
            variant="secondary"
            onClick={() => setIsModalOpen(false)}
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
          variant="primary"
          disabled={
            (deployState === "idle" && !isDeployReady) ||
            deployState === "deploying"
          }
          onClick={() => {
            if (deployState === "idle") executeDeployment();
            if (deployState === "success" || deployState === "error") {
              setIsModalOpen(false);
              if (deployState === "success") onDeploySuccess();
            }
          }}
        />
      </div>
    </div>
  );
};

export default DeploymentModal;
