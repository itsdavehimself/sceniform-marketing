import { useState } from "react";
import styles from "./App.module.scss";

// Custom Hooks
import { useDiffProcessor } from "./hooks/useDiffProcessor";
import { useScenarios } from "./hooks/useScenarios";

// Components
import BlueprintPanel from "./components/BlueprintPanel/BlueprintPanel";
import Header from "./components/Header/Header";
import DiffViewer from "./components/DiffViewer/DiffViewer";

function App() {
  // --- UI & JSON State ---
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [prodJson, setProdJson] = useState<string>("");
  const [sandboxJson, setSandboxJson] = useState<string>("");
  const [isReverse, setIsReverse] = useState<boolean>(false);

  // --- Filter Toggles ---
  const [ignoreScenarioName, setIgnoreScenarioName] = useState<boolean>(true);
  const [ignoreConnections, setIgnoreConnections] = useState<boolean>(false);
  const [ignoreModuleNames, setIgnoreModuleNames] = useState<boolean>(false);
  const [showRawMappings, setShowRawMappings] = useState<boolean>(false);
  const [showErrorsOnly, setShowErrorsOnly] = useState<boolean>(false);

  // --- View State ---
  const [collapsedIds, setCollapsedIds] = useState<Set<string | number>>(
    new Set(),
  );
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [highlightedModuleId, setHighlightedModuleId] = useState<
    string | number | null
  >(null);

  // --- Scenario Selection State ---
  const [selectedProdId, setSelectedProdId] = useState<string>("");
  const [selectedSandboxId, setSelectedSandboxId] = useState<string>("");

  // --- API Hook ---
  const { scenarios, isLoading, fetchBlueprint, updateScenario } = useScenarios(
    {
      setProdJson,
      setSandboxJson,
      setShowErrorsOnly,
    },
  );

  // --- Data Processing Hook ---
  const { diffReport, errorStats, processedGroups, sortedGroupKeys } =
    useDiffProcessor({
      prodJson,
      sandboxJson,
      isReverse,
      ignoreScenarioName,
      ignoreConnections,
      ignoreModuleNames,
      showRawMappings,
    });

  // --- UI Handlers ---
  const toggleCollapse = (id: string | number) => {
    const newSet = new Set(collapsedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCollapsedIds(newSet);
  };

  const togglePathCollapse = (path: string) => {
    const newSet = new Set(collapsedPaths);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setCollapsedPaths(newSet);
  };

  const handleToggleAll = () => {
    if (collapsedIds.size > 0) {
      setCollapsedIds(new Set());
    } else {
      if (!diffReport) return;
      const allIds = new Set<string | number>();
      diffReport.changes.forEach((c: any) => allIds.add(c.moduleId));
      setCollapsedIds(allIds);
    }
    if (collapsedPaths.size > 0) setCollapsedPaths(new Set());
  };

  const handleScrollToModule = (moduleId: string | number) => {
    const element = document.getElementById(`module-card-${moduleId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedModuleId(moduleId);
      setTimeout(() => setHighlightedModuleId(null), 2000);
    }
  };

  // --- UI Handlers ---

  // Replace the effects with this handler:
  const handleToggleShowErrors = (newValue: boolean) => {
    // 1. If trying to turn ON, but there are no errors, force it off.
    if (newValue && errorStats.moduleCount === 0) {
      setShowErrorsOnly(false);
      return;
    }

    // 2. Set the toggle state
    setShowErrorsOnly(newValue);

    // 3. If turning ON, automatically expand the errored modules simultaneously
    if (newValue && errorStats.moduleCount > 0) {
      setCollapsedIds((prevCollapsed) => {
        const nextCollapsed = new Set(prevCollapsed);
        let changed = false;
        errorStats.errorModuleIds.forEach((id: any) => {
          if (nextCollapsed.has(id)) {
            nextCollapsed.delete(id);
            changed = true;
            local;
          }
        });
        return changed ? nextCollapsed : prevCollapsed; // Only update if something actually changed
      });
    }
  };

  const isAllExpanded = collapsedIds.size === 0 && collapsedPaths.size === 0;

  return (
    <div className={`${styles.appContainer} ${isDarkMode ? styles.dark : ""}`}>
      <Header
        updateScenario={updateScenario}
        currentProdId={selectedProdId}
        currentSandboxId={selectedSandboxId}
        prodJson={prodJson}
        sandboxJson={sandboxJson}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        isReverse={isReverse}
        setIsReverse={setIsReverse}
        ignoreScenarioName={ignoreScenarioName}
        setIgnoreScenarioName={setIgnoreScenarioName}
        ignoreConnections={ignoreConnections}
        setIgnoreConnections={setIgnoreConnections}
        ignoreModuleNames={ignoreModuleNames}
        setIgnoreModuleNames={setIgnoreModuleNames}
        showRawMappings={showRawMappings}
        setShowRawMappings={setShowRawMappings}
        isAllExpanded={isAllExpanded}
        handleToggleAll={handleToggleAll}
      />

      <div className={styles.mainContent}>
        <BlueprintPanel
          title={isReverse ? "Sandbox (Old)" : "Production (Existing)"}
          selectedId={isReverse ? selectedSandboxId : selectedProdId}
          scenarios={scenarios}
          jsonValue={isReverse ? sandboxJson : prodJson}
          isLoading={isLoading}
          onSelectChange={(val) =>
            isReverse ? setSelectedSandboxId(val) : setSelectedProdId(val)
          }
          onFetch={() =>
            fetchBlueprint(
              isReverse ? "sandbox" : "prod",
              isReverse ? selectedSandboxId : selectedProdId,
            )
          }
          onJsonChange={isReverse ? setSandboxJson : setProdJson}
        />

        <DiffViewer
          isDarkMode={isDarkMode}
          isReverse={isReverse}
          diffReport={diffReport}
          errorStats={errorStats}
          showErrorsOnly={showErrorsOnly}
          setShowErrorsOnly={handleToggleShowErrors}
          sortedGroupKeys={sortedGroupKeys}
          processedGroups={processedGroups}
          collapsedPaths={collapsedPaths}
          togglePathCollapse={togglePathCollapse}
          collapsedIds={collapsedIds}
          toggleCollapse={toggleCollapse}
          highlightedModuleId={highlightedModuleId}
          handleScrollToModule={handleScrollToModule}
        />

        <BlueprintPanel
          title={isReverse ? "Production (Existing)" : "Sandbox (Old)"}
          selectedId={isReverse ? selectedProdId : selectedSandboxId}
          scenarios={scenarios}
          jsonValue={isReverse ? prodJson : sandboxJson}
          isLoading={isLoading}
          onSelectChange={(val) =>
            isReverse ? setSelectedProdId(val) : setSelectedSandboxId(val)
          }
          onFetch={() =>
            fetchBlueprint(
              isReverse ? "prod" : "sandbox",
              isReverse ? selectedProdId : selectedSandboxId,
            )
          }
          onJsonChange={isReverse ? setProdJson : setSandboxJson}
        />
      </div>
    </div>
  );
}

export default App;
