import React from "react";
import styles from "./DiffViewer.module.scss";
import PathGroup from "./PathGroup/PathGroup";
import {
  FoldVertical,
  UnfoldVertical,
  FileBraces,
  GitCompare,
} from "lucide-react";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";

interface DiffViewerProps {
  isDarkMode: boolean;
  isReverse: boolean;
  diffReport: any;
  errorStats: any;
  showErrorsOnly: boolean;
  sortedGroupKeys: string[];
  processedGroups: any;
  collapsedPaths: Set<string>;
  togglePathCollapse: (path: string) => void;
  collapsedIds: Set<string | number>;
  toggleCollapse: (id: string | number) => void;
  highlightedModuleId: string | number | null;
  handleScrollToModule: (id: string | number) => void;
  isAllExpanded: boolean;
  handleToggleAll: () => void;
  viewBlueprints: boolean;
  setViewBlueprints: React.Dispatch<React.SetStateAction<boolean>>;
  prodJson: string;
  sandboxJson: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  isDarkMode,
  isReverse,
  diffReport,
  errorStats,
  showErrorsOnly,
  sortedGroupKeys,
  processedGroups,
  collapsedPaths,
  togglePathCollapse,
  collapsedIds,
  toggleCollapse,
  highlightedModuleId,
  handleScrollToModule,
  isAllExpanded,
  handleToggleAll,
  viewBlueprints,
  setViewBlueprints,
  prodJson,
  sandboxJson,
}) => {
  const wasLabel = isReverse ? "SANDBOX (OLD)" : "PROD (OLD)";
  const becomesLabel = isReverse ? "PROD (NEW)" : "SANDBOX (NEW)";

  const getSafeJson = (data: any) => {
    if (!data) return {};
    if (typeof data !== "string") return data;

    try {
      return JSON.parse(data);
    } catch (e) {
      console.warn("Invalid JSON provided to DiffViewer");
      return { error: "Invalid JSON format" };
    }
  };

  const leftData = getSafeJson(isReverse ? sandboxJson : prodJson);
  const rightData = getSafeJson(isReverse ? prodJson : sandboxJson);

  return (
    <div className={styles.column} style={{ flex: 1.5 }}>
      <div className={styles.comparisonControls}>
        {diffReport && (
          <>
            <button
              className={styles.controlButton}
              title={viewBlueprints ? "View Comparison" : "View Blueprints"}
              onClick={() => setViewBlueprints((prev) => !prev)}
            >
              {viewBlueprints ? (
                <GitCompare size={20} />
              ) : (
                <FileBraces size={20} />
              )}
            </button>
            <button
              onClick={handleToggleAll}
              className={styles.controlButton}
              title={isAllExpanded ? "Collapse All" : "Expand All"}
            >
              {isAllExpanded ? (
                <FoldVertical size={20} />
              ) : (
                <UnfoldVertical size={20} />
              )}
            </button>
          </>
        )}
      </div>
      <div id="diff-scroll-container" className={styles.scrollContainer}>
        {!viewBlueprints ? (
          <>
            {!diffReport ? (
              <div className={styles.emptyState}>
                Load your blueprints to compare.
              </div>
            ) : diffReport.changes.length === 0 ? (
              <div className={styles.successState}>
                No Logic Changes Detected
              </div>
            ) : (
              sortedGroupKeys.map((path) => {
                // Check if ancestor is collapsed
                const closestCollapsedAncestor = sortedGroupKeys.find(
                  (potentialAncestor) =>
                    collapsedPaths.has(potentialAncestor) &&
                    path.startsWith(potentialAncestor + " ➞ "),
                );

                if (closestCollapsedAncestor) return null;

                // Filter logic
                const groupItems = processedGroups[path];
                const filteredItems = showErrorsOnly
                  ? groupItems.filter((item: any) => {
                      const id =
                        item.type === "REPLACEMENT"
                          ? item.moduleId
                          : item.moduleId;
                      return errorStats.errorModuleIds.has(id);
                    })
                  : groupItems;

                if (filteredItems.length === 0) return null;

                return (
                  <PathGroup
                    key={path}
                    path={path}
                    isDarkMode={isDarkMode}
                    processedGroups={processedGroups}
                    filteredItems={filteredItems}
                    isPathCollapsed={
                      !["Scenario Settings", "Main Flow"].includes(path) &&
                      collapsedPaths.has(path)
                    }
                    togglePathCollapse={togglePathCollapse}
                    collapsedIds={collapsedIds}
                    toggleCollapse={toggleCollapse}
                    highlightedModuleId={highlightedModuleId}
                    handleScrollToModule={handleScrollToModule}
                    errorStats={errorStats}
                    wasLabel={wasLabel}
                    becomesLabel={becomesLabel}
                  />
                );
              })
            )}
          </>
        ) : (
          <div className={styles.blueprintViewer}>
            {/* WRAPPER 1 */}
            <div className={styles.jsonWrapper}>
              <JsonView
                src={leftData}
                enableClipboard={false}
                theme="atom"
                className={styles.jsonViewer}
              />
            </div>

            {/* WRAPPER 2 */}
            <div className={styles.jsonWrapper}>
              <JsonView
                src={rightData}
                enableClipboard={false}
                theme="atom"
                className={styles.jsonViewer}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffViewer;
