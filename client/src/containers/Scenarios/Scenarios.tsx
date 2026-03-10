import { useState, useEffect } from "react";
import styles from "./Scenarios.module.scss";
import WorkspaceDropdown from "../../components/WorkspaceDropdown/WorkspaceDropdown";
import { useMakeContext } from "../../context/MakeContext";
import { useHooks } from "../../hooks/useHooks";

type ScenarioView = "deployment" | "changelog" | "audit" | "documentation";

// Custom Hooks (Now completely decoupled)
import { useDiffProcessor } from "../../hooks/useDiffProcessor";
import { useScenarios } from "../../hooks/useScenarios";
import { useConnections } from "../../hooks/useConnections";

// Components
import BlueprintPanel from "../../components/BlueprintPanel/BlueprintPanel";
import ComparisonHeader from "../../components/DiffViewer/ComparisonHeader/ComparisonHeader";
import DiffViewer from "../../components/DiffViewer/DiffViewer";
import SectionHeader from "../../components/SectionHeader/SectionHeader";
import SettingsSidebar from "../../components/DiffViewer/SettingsSidebar/SettingsSidebar";
import OverviewSidebar from "../../components/DiffViewer/OverviewSidebar/OverviewSidebar";

const Scenarios: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [prodJson, setProdJson] = useState<string>("");
  const [sandboxJson, setSandboxJson] = useState<string>("");
  const [isReverse, setIsReverse] = useState<boolean>(false);

  // --- Filter Toggles ---
  const [ignoreScenarioName, setIgnoreScenarioName] = useState<boolean>(true);
  const [ignoreConnections, setIgnoreConnections] = useState<boolean>(true);
  const [ignoreHooks, setIgnoreHooks] = useState<boolean>(true);
  const [ignoreModuleNames, setIgnoreModuleNames] = useState<boolean>(false);
  const [showRawMappings, setShowRawMappings] = useState<boolean>(false);
  const [showErrorsOnly, setShowErrorsOnly] = useState<boolean>(false);

  const [currentView, setCurrentView] = useState<ScenarioView>("deployment");

  // --- Diff Viewer State ---
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [collapsedIds, setCollapsedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [highlightedModuleId, setHighlightedModuleId] = useState<
    string | number | null
  >(null);
  const [isAllExpanded, setIsAllExpanded] = useState(true);
  const [viewBlueprints, setViewBlueprints] = useState<boolean>(false);

  const [selectedProdId, setSelectedProdId] = useState<string>("");
  const [selectedSandboxId, setSelectedSandboxId] = useState<string>("");

  // --- GLOBAL CONTEXT ---
  // (You can delete targetOrg/targetTeam from MakeContext.tsx, we don't need them globally!)
  const {
    activeOrg,
    activeTeam,
    workspaceGroups,
    availableZones,
    setActiveWorkspace,
  } = useMakeContext();

  // --- LOCAL WORKSPACE STATE ---
  const [baseOrg, setBaseOrg] = useState(activeOrg);
  const [baseTeam, setBaseTeam] = useState(activeTeam);

  const [targetOrg, setTargetOrg] = useState(activeOrg);
  const [targetTeam, setTargetTeam] = useState(activeTeam);

  // SYNC GLOBAL SIDEBAR TO BASE WORKSPACE
  useEffect(() => {
    setBaseOrg(activeOrg);
    setBaseTeam(activeTeam);

    setTargetOrg((prev) => prev || activeOrg);
    setTargetTeam((prev) => prev || activeTeam);
  }, [activeOrg, activeTeam]);

  const handleWorkspaceChange = (
    side: "base" | "target",
    orgId: number,
    teamId: number,
  ) => {
    const org = workspaceGroups.find((g) => g.orgId === orgId);
    const team = org?.teams.find((t) => t.id === teamId) || null;

    if (side === "base") {
      setActiveWorkspace(orgId, teamId);
      setBaseOrg(
        org ? { id: org.orgId, name: org.orgName, zone: org.zone } : null,
      );
      setBaseTeam(team);
      setSelectedProdId("");
      setProdJson("");
    } else {
      setTargetOrg(
        org ? { id: org.orgId, name: org.orgName, zone: org.zone } : null,
      );
      setTargetTeam(team);
      setSelectedSandboxId("");
      setSandboxJson("");
    }
  };

  // --- 2 INDEPENDENT HOOK INSTANCES ---
  const {
    scenarios: baseScenarios,
    isLoading: baseLoading,
    fetchBlueprint: fetchBaseBlueprint,
    updateScenario,
  } = useScenarios({
    teamId: baseTeam?.id,
    zone: baseOrg?.zone,
    setJson: setProdJson,
    setShowErrorsOnly,
  });

  const {
    scenarios: targetScenarios,
    isLoading: targetLoading,
    fetchBlueprint: fetchTargetBlueprint,
  } = useScenarios({
    teamId: targetTeam?.id,
    zone: targetOrg?.zone,
    setJson: setSandboxJson,
    setShowErrorsOnly,
  });

  const {
    connections: sourceConnectionsList,
    isLoading: isConnectionsLoading,
  } = useConnections(targetTeam?.id, targetOrg?.zone);

  const { connections: targetConnectionsList } = useConnections(
    baseTeam?.id,
    baseOrg?.zone,
  );

  const { hooks: sourceHooksList, isLoading: isHooksLoading } = useHooks(
    targetTeam?.id,
    targetOrg?.zone,
  );

  const { hooks: targetHooksList } = useHooks(baseTeam?.id, baseOrg?.zone);

  // --- DIFF ENGINE ---
  const { diffReport, errorStats, sortedGroupKeys, processedGroups } =
    useDiffProcessor({
      prodJson,
      sandboxJson,
      isReverse,
      ignoreScenarioName,
      ignoreConnections,
      ignoreHooks,
      ignoreModuleNames,
      showRawMappings,
      prodConnections: targetConnectionsList,
      sandboxConnections: sourceConnectionsList,
      prodHooks: targetHooksList,
      sandboxHooks: sourceHooksList,
    });

  const togglePathCollapse = (path: string) => {
    const newSet = new Set(collapsedPaths);
    newSet.has(path) ? newSet.delete(path) : newSet.add(path);
    setCollapsedPaths(newSet);
  };

  const toggleCollapse = (id: string | number) => {
    const newSet = new Set(collapsedIds);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setCollapsedIds(newSet);
  };

  const handleScrollToModule = (id: string | number) => {
    setHighlightedModuleId(id);

    const el = document.getElementById(`module-card-${id}`);
    const container = document.getElementById("diff-scroll-container");

    if (el && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();

      const scrollTop =
        container.scrollTop +
        (elRect.top - containerRect.top) -
        containerRect.height / 2 +
        elRect.height / 2;

      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });

      setTimeout(() => setHighlightedModuleId(null), 2000);
    }
  };

  const handleToggleAll = () => {
    if (isAllExpanded) {
      setCollapsedPaths(new Set(sortedGroupKeys));
      const allIds = new Set<string | number>();
      Object.values(processedGroups).forEach((items: any) => {
        items.forEach((i: any) => allIds.add(i.moduleId));
      });
      setCollapsedIds(allIds);
    } else {
      setCollapsedPaths(new Set());
      setCollapsedIds(new Set());
    }
    setIsAllExpanded(!isAllExpanded);
  };

  const buttons = [
    { title: "Deploy", view: "deployment" as ScenarioView },
    // { title: "Changelog", view: "changelog" as ScenarioView },
    // { title: "Audit", view: "audit" as ScenarioView },
    // { title: "Documentation", view: "documentation" as ScenarioView },
  ];

  // --- THE RIGHT HEADER CONTENT ---
  const headerRightContent = (
    <div className={styles.headerActions}>
      <div className={styles.workspaceSelectorGroup}>
        <span className={styles.label}>Base:</span>
        <div className={styles.dropdownWrapper}>
          <WorkspaceDropdown
            groups={workspaceGroups}
            availableZones={availableZones}
            selectedOrgId={baseOrg?.id}
            selectedTeamId={baseTeam?.id}
            onSelect={(orgId, teamId) =>
              handleWorkspaceChange("base", orgId, teamId)
            }
            placeholder="Select base"
          />
        </div>
      </div>
      <div className={styles.workspaceSelectorGroup}>
        <span className={styles.label}>Target:</span>
        <div className={styles.dropdownWrapper}>
          <WorkspaceDropdown
            groups={workspaceGroups}
            availableZones={availableZones}
            selectedOrgId={targetOrg?.id}
            selectedTeamId={targetTeam?.id}
            onSelect={(orgId, teamId) =>
              handleWorkspaceChange("target", orgId, teamId)
            }
            placeholder="Select target"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`${styles.scenariosContainer} ${isDarkMode ? "dark" : ""}`}>
      {/* 🚀 THE FIX: Moved SectionHeader OUTSIDE of mainContent so it spans 100% of the screen! */}
      <SectionHeader
        title="Scenarios"
        currentView={currentView}
        setCurrentView={setCurrentView}
        buttons={buttons}
        rightContent={headerRightContent}
      />

      {/* The diff engine remains safely contained in the 1200px center layout */}
      <div className={styles.mainContent}>
        <div className={styles.deploymentContainer}>
          <div className={styles.sidebarContainer}>
            <OverviewSidebar
              diffReport={diffReport}
              errorStats={errorStats}
              processedGroups={processedGroups}
              handleScrollToModule={handleScrollToModule}
              viewBlueprints={viewBlueprints}
              setViewBlueprints={setViewBlueprints}
            />
            <SettingsSidebar
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              ignoreScenarioName={ignoreScenarioName}
              setIgnoreScenarioName={setIgnoreScenarioName}
              ignoreConnections={ignoreConnections}
              setIgnoreConnections={setIgnoreConnections}
              ignoreHooks={ignoreHooks}
              setIgnoreHooks={setIgnoreHooks}
              ignoreModuleNames={ignoreModuleNames}
              setIgnoreModuleNames={setIgnoreModuleNames}
              showRawMappings={showRawMappings}
              setShowRawMappings={setShowRawMappings}
              showErrorsOnly={showErrorsOnly}
              setShowErrorsOnly={setShowErrorsOnly}
            />
          </div>

          <div className={styles.comparisonContainer}>
            <ComparisonHeader
              updateScenario={(id, json) => updateScenario(id, json)}
              currentProdId={selectedProdId}
              currentSandboxId={selectedSandboxId}
              prodJson={prodJson}
              sandboxJson={sandboxJson}
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
              isReverse={isReverse}
              setIsReverse={setIsReverse}
              ignoreScenarioName={ignoreScenarioName}
              ignoreConnections={ignoreConnections}
              ignoreModuleNames={ignoreModuleNames}
              diffReport={diffReport}
              onDeploySuccess={() => fetchBaseBlueprint(selectedProdId)}
              sourceConnectionsList={sourceConnectionsList}
              targetConnectionsList={targetConnectionsList}
              isConnectionsLoading={isConnectionsLoading}
              baseZone={baseOrg?.zone}
              targetZone={targetOrg?.zone}
              baseTeamId={baseTeam?.id}
              targetTeamId={targetTeam?.id}
              sourceHooksList={sourceHooksList || []}
              targetHooksList={targetHooksList || []}
              isHooksLoading={isHooksLoading}
            />

            <div className={styles.blueprints}>
              {/* BASE PANEL */}
              <BlueprintPanel
                title={isReverse ? "Target (Sandbox)" : "Base (Production)"}
                selectedId={isReverse ? selectedSandboxId : selectedProdId}
                scenarios={isReverse ? targetScenarios : baseScenarios}
                jsonValue={isReverse ? sandboxJson : prodJson}
                isLoading={isReverse ? targetLoading : baseLoading}
                onSelectChange={(val) => {
                  if (isReverse) {
                    setSelectedSandboxId(val);
                    fetchTargetBlueprint(val);
                  } else {
                    setSelectedProdId(val);
                    fetchBaseBlueprint(val);
                  }
                }}
                onRefresh={() =>
                  isReverse
                    ? fetchTargetBlueprint(selectedSandboxId)
                    : fetchBaseBlueprint(selectedProdId)
                }
                onJsonChange={isReverse ? setSandboxJson : setProdJson}
              />

              {/* TARGET PANEL */}
              <BlueprintPanel
                title={!isReverse ? "Target (Sandbox)" : "Base (Production)"}
                selectedId={!isReverse ? selectedSandboxId : selectedProdId}
                scenarios={!isReverse ? targetScenarios : baseScenarios}
                jsonValue={!isReverse ? sandboxJson : prodJson}
                isLoading={!isReverse ? targetLoading : baseLoading}
                onSelectChange={(val) => {
                  if (!isReverse) {
                    setSelectedSandboxId(val);
                    fetchTargetBlueprint(val);
                  } else {
                    setSelectedProdId(val);
                    fetchBaseBlueprint(val);
                  }
                }}
                onRefresh={() =>
                  !isReverse
                    ? fetchTargetBlueprint(selectedSandboxId)
                    : fetchBaseBlueprint(selectedProdId)
                }
                onJsonChange={!isReverse ? setSandboxJson : setProdJson}
              />
            </div>

            <DiffViewer
              isDarkMode={isDarkMode}
              isReverse={isReverse}
              diffReport={diffReport}
              errorStats={errorStats}
              showErrorsOnly={showErrorsOnly}
              sortedGroupKeys={sortedGroupKeys}
              processedGroups={processedGroups}
              collapsedPaths={collapsedPaths}
              togglePathCollapse={togglePathCollapse}
              collapsedIds={collapsedIds}
              toggleCollapse={toggleCollapse}
              highlightedModuleId={highlightedModuleId}
              handleScrollToModule={handleScrollToModule}
              isAllExpanded={isAllExpanded}
              handleToggleAll={handleToggleAll}
              viewBlueprints={viewBlueprints}
              setViewBlueprints={setViewBlueprints}
              prodJson={prodJson}
              sandboxJson={sandboxJson}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scenarios;
