import React, { useState } from "react";
import ActionButton from "../../ActionButton/ActionButton";
import SectionHeaderButton from "../../SectionHeader/SectionHeaderButton/SectionHeaderButton";
import styles from "./DeploymentModal.module.scss";
import { useDeploymentMappings } from "../../../hooks/useDeploymentMappings";
import MappingRow from "./MappingRow/MappingRow";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

interface DeploymentModalProps {
  isReverse: boolean;
  sourceJson: string;
  targetJson: string;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleDeploy: (mappings: {
    connections: Record<number, number>;
    hooks: Record<number, number>;
  }) => Promise<void>;
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

// Defined Tab Types
type TabType = "connections" | "hooks" | "structures" | "stores";

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
  sourceHooksList,
  targetHooksList,
  isHooksLoading,
  targetScenarioId,
  targetZone,
  targetTeamId,
}) => {
  const {
    sourceConnections,
    sourceHooks,
    connMappings,
    hookMappings,
    autoConnMappings,
    autoHookMappings,
    handleConnMappingChange,
    handleHookMappingChange,
  } = useDeploymentMappings(
    sourceJson,
    targetJson,
    sourceConnectionsList,
    targetConnectionsList,
    sourceHooksList,
    targetHooksList,
  );

  console.log("source-conns:", sourceConnectionsList);
  console.log("target-conss:", targetConnectionsList);

  const [deployState, setDeployState] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("connections");

  const isDeployReady =
    sourceConnections.every((conn) => !!connMappings[conn.id]) &&
    sourceHooks.every((hook) => !!hookMappings[hook.id]);

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
      {
        text: "> Applying environment bindings (Connections & Webhooks)...",
        type: "info",
      },
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
      await handleDeploy({ connections: connMappings, hooks: hookMappings });

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
              To prevent overwriting live data, map your{" "}
              <strong>{isReverse ? "Production" : "Sandbox"}</strong>{" "}
              environment bindings to the target environment.
            </p>
          </div>

          {/* TAB NAVIGATION */}
          <div className={styles.tabNavigation}>
            <SectionHeaderButton
              title="Connections"
              isActive={activeTab === "connections"}
              onClick={() => setActiveTab("connections")}
            />
            <SectionHeaderButton
              title="Hooks"
              isActive={activeTab === "hooks"}
              onClick={() => setActiveTab("hooks")}
            />
            <SectionHeaderButton
              title="Structures"
              isActive={activeTab === "structures"}
              onClick={() => setActiveTab("structures")}
            />
            <SectionHeaderButton
              title="Stores"
              isActive={activeTab === "stores"}
              onClick={() => setActiveTab("stores")}
            />
          </div>

          {isConnectionsLoading || isHooksLoading ? (
            <div className={styles.loadingContainer}>
              <LoadingSpinner dimensions={{ x: 6, y: 6 }} />
            </div>
          ) : (
            <div className={styles.mappingsContainer}>
              {/* --- CONNECTIONS TAB --- */}
              {activeTab === "connections" &&
                (sourceConnections.length > 0 ? (
                  <div className={styles.mappingSection}>
                    <h4 className={styles.sectionTitle}>
                      Connections (OAuth / API Keys)
                    </h4>
                    {sourceConnections.map((conn) => (
                      <MappingRow
                        key={`conn-${conn.id}`}
                        entity={conn}
                        type="connection"
                        sourceList={sourceConnectionsList}
                        targetList={targetConnectionsList}
                        currentMapping={connMappings[conn.id] || ""}
                        isAutoMapped={
                          autoConnMappings[conn.id] === connMappings[conn.id]
                        }
                        onMappingChange={handleConnMappingChange}
                        targetScenarioId={targetScenarioId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyTabContainer}>
                    <p>No connections detected in this blueprint.</p>
                  </div>
                ))}

              {/* --- WEBHOOKS TAB --- */}
              {activeTab === "hooks" &&
                (sourceHooks.length > 0 ? (
                  <div className={styles.mappingSection}>
                    <h4 className={styles.sectionTitle}>
                      Entry Points (Webhooks / Mailhooks)
                    </h4>
                    {sourceHooks.map((hook) => (
                      <MappingRow
                        key={`hook-${hook.id}`}
                        entity={hook}
                        type="hook"
                        sourceList={sourceHooksList}
                        targetList={targetHooksList}
                        currentMapping={hookMappings[hook.id] || ""}
                        isAutoMapped={
                          autoHookMappings[hook.id] === hookMappings[hook.id]
                        }
                        onMappingChange={handleHookMappingChange}
                        targetScenarioId={targetScenarioId}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyTabContainer}>
                    <p>No entry points detected in this blueprint.</p>
                  </div>
                ))}

              {/* --- STRUCTURES TAB (Placeholder) --- */}
              {activeTab === "structures" && (
                <div className={styles.emptyTabContainer}>
                  <p>No data structures detected in this blueprint.</p>
                </div>
              )}

              {/* --- STORES TAB (Placeholder) --- */}
              {activeTab === "stores" && (
                <div className={styles.emptyTabContainer}>
                  <p>No data stores detected in this blueprint.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- DEPLOYMENT TERMINAL (Hidden when idle) --- */}
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
