import React from "react";
import styles from "./PathGroup.module.scss";
import ModuleCard from "../ModuleCard/ModuleCard";
import ReplacedModuleGroup from "./ReplacedModuleGroup/ReplacedModuleGroup";
import PathHeader from "./PathHeader/PathHeader";
import Busline from "./Busline/Busline";

const getLevelStyles = (p: string, isDarkMode: boolean) => {
  const isMergedFlow = p.includes("🔀 Merged");

  // Strip out the merge modifier to calculate the true base depth!
  const normalizedPath = p.replace(/ 🔀 Merged/g, "");

  // Now, if this is a Merged flow inside the Main Flow, it will correctly trigger depth: 0
  if (
    normalizedPath === "Scenario Settings" ||
    normalizedPath === "Main Flow"
  ) {
    return {
      depth: 0,
      color: isMergedFlow
        ? isDarkMode
          ? "#4db6ac"
          : "#00897b"
        : isDarkMode
          ? "#777"
          : "#ccc",
      indent: 0,
      label: p,
      isErrorFlow: false,
      isBranchFlow: false,
      isMergedFlow,
    };
  }

  const segments = normalizedPath.split(" ➞ ");
  const depth = segments.length;
  const isErrorFlow = p.includes("⚠️ Error Handler");
  const isBranchFlow = p.includes("(Branch");

  const colors = [
    "#2196f3",
    "#9c27b0",
    "#009688",
    "#ff9800",
    "#e91e63",
    "#795548",
  ];
  let color = colors[(depth - 1) % colors.length];

  if (isErrorFlow) {
    color = isDarkMode ? "#e57373" : "#d32f2f";
  } else if (isBranchFlow) {
    color = isDarkMode ? "#7986cb" : "#3f51b5";
  } else if (isMergedFlow) {
    color = isDarkMode ? "#4db6ac" : "#00897b";
  }

  return {
    depth,
    color,
    indent: depth * 20,
    label: segments[segments.length - 1],
    isErrorFlow,
    isBranchFlow,
    isMergedFlow,
  };
};

const getRecursiveModuleCount = (rootPath: string, processedGroups: any) => {
  let count = 0;
  Object.keys(processedGroups).forEach((key) => {
    if (key === rootPath || key.startsWith(`${rootPath} ➞ `)) {
      count += processedGroups[key].length;
    }
  });
  return count;
};

interface PathGroupProps {
  path: string;
  isDarkMode: boolean;
  processedGroups: any;
  filteredItems: any[];
  isPathCollapsed: boolean;
  togglePathCollapse: (path: string) => void;
  collapsedIds: Set<string | number>;
  toggleCollapse: (id: string | number) => void;
  highlightedModuleId: string | number | null;
  handleScrollToModule: (id: string | number) => void;
  errorStats: any;
  wasLabel: string;
  becomesLabel: string;
}

const PathGroup: React.FC<PathGroupProps> = ({
  path,
  isDarkMode,
  processedGroups,
  filteredItems,
  isPathCollapsed,
  togglePathCollapse,
  collapsedIds,
  toggleCollapse,
  highlightedModuleId,
  handleScrollToModule,
  errorStats,
  wasLabel,
  becomesLabel,
}) => {
  const { depth, color, indent, label, isErrorFlow } = getLevelStyles(
    path,
    isDarkMode,
  );
  const isRootPath = path === "Scenario Settings" || path === "Main Flow";
  const groupItems = processedGroups[path];
  const isGroupDisabled = groupItems.length > 0 && groupItems[0].isDisabled;
  const hiddenCount = isPathCollapsed
    ? getRecursiveModuleCount(path, processedGroups)
    : 0;

  const displayLabel = label
    .replace("⚠️ Error Handler", "")
    .replace(/🔀 Merged/g, "")
    .trim();

  return (
    <div
      className={styles.pathWrapper}
      style={{
        marginLeft: `${indent}px`,
        paddingLeft: depth > 0 ? "1rem" : "1rem",
      }}
    >
      {depth > 0 && (
        <Busline
          color={color}
          isErrorFlow={isErrorFlow}
          isDarkMode={isDarkMode}
        />
      )}

      <PathHeader
        path={path}
        label={label}
        displayLabel={displayLabel}
        depth={depth}
        color={color}
        isRootPath={isRootPath}
        isPathCollapsed={isPathCollapsed}
        isErrorFlow={isErrorFlow}
        isGroupDisabled={isGroupDisabled}
        togglePathCollapse={togglePathCollapse}
      />

      {isPathCollapsed ? (
        <div className={styles.collapsedMessage}>
          ℹ️ {hiddenCount} {hiddenCount === 1 ? "change" : "changes"} hidden.
        </div>
      ) : (
        filteredItems.map((item: any, idx: number) => {
          if (item.type === "REPLACEMENT") {
            return (
              <ReplacedModuleGroup
                key={idx}
                item={item}
                isDarkMode={isDarkMode}
                highlightedModuleId={highlightedModuleId}
                collapsedIds={collapsedIds}
                errorStats={errorStats}
                wasLabel={wasLabel}
                becomesLabel={becomesLabel}
                toggleCollapse={toggleCollapse}
                handleScrollToModule={handleScrollToModule}
              />
            );
          }

          return (
            <ModuleCard
              key={idx}
              change={item}
              isDarkMode={isDarkMode}
              isHighlighted={highlightedModuleId == item.moduleId}
              isCollapsed={collapsedIds.has(item.moduleId)}
              hasError={errorStats.errorModuleIds.has(item.moduleId)}
              onToggle={() => toggleCollapse(item.moduleId)}
              wasLabel={wasLabel}
              becomesLabel={becomesLabel}
              handleScrollToModule={handleScrollToModule}
            />
          );
        })
      )}
    </div>
  );
};

export default PathGroup;
