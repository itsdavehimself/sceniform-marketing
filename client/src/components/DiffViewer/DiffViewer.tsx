import React from "react";
import styles from "./DiffViewer.module.scss";
import DiffHeader from "./DiffHeader/DiffHeader";
import PathGroup from "./PathGroup/PathGroup";

interface DiffViewerProps {
  isDarkMode: boolean;
  isReverse: boolean;
  diffReport: any;
  errorStats: any;
  showErrorsOnly: boolean;
  setShowErrorsOnly: (val: boolean) => void;
  sortedGroupKeys: string[];
  processedGroups: any;
  collapsedPaths: Set<string>;
  togglePathCollapse: (path: string) => void;
  collapsedIds: Set<string | number>;
  toggleCollapse: (id: string | number) => void;
  highlightedModuleId: string | number | null;
  handleScrollToModule: (id: string | number) => void;
}

const DiffViewer: React.FC<DiffViewerProps> = ({
  isDarkMode,
  isReverse,
  diffReport,
  errorStats,
  showErrorsOnly,
  setShowErrorsOnly,
  sortedGroupKeys,
  processedGroups,
  collapsedPaths,
  togglePathCollapse,
  collapsedIds,
  toggleCollapse,
  highlightedModuleId,
  handleScrollToModule,
}) => {
  const wasLabel = isReverse ? "SANDBOX (OLD)" : "PROD (OLD)";
  const becomesLabel = isReverse ? "PROD (NEW)" : "SANDBOX (NEW)";

  return (
    <div className={styles.column} style={{ flex: 1.5 }}>
      <DiffHeader
        diffReport={diffReport}
        errorStats={errorStats}
        showErrorsOnly={showErrorsOnly}
        setShowErrorsOnly={setShowErrorsOnly}
      />

      <div className={styles.scrollContainer}>
        {!diffReport ? (
          <div className={styles.emptyState}>
            Add both blueprints to generate report.
          </div>
        ) : diffReport.changes.length === 0 ? (
          <div className={styles.successState}>
            ✅ No Logic Changes Detected
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
                    item.type === "REPLACEMENT" ? item.moduleId : item.moduleId;
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
      </div>
    </div>
  );
};

export default DiffViewer;
