import React from "react";
import styles from "./PathGroup.module.scss";
import ModuleCard from "../ModuleCard/ModuleCard";
import ReplacedModuleGroup from "./ReplacedModuleGroup/ReplacedModuleGroup";
import PathHeader from "./PathHeader/PathHeader";
import Busline from "./Busline/Busline";

const getLevelStyles = (p: string, isDarkMode: boolean) => {
  if (p === "Scenario Settings" || p === "Main Flow") {
    return {
      depth: 0,
      color: isDarkMode ? "#777" : "#ccc",
      indent: 0,
      label: p,
      isErrorFlow: false,
    };
  }
  const segments = p.split(" ➞ ");
  const depth = segments.length;
  const isErrorFlow = p.includes("⚠️ Error Handler");
  const colors = [
    "#2196f3",
    "#9c27b0",
    "#009688",
    "#ff9800",
    "#e91e63",
    "#795548",
  ];
  const color = isErrorFlow
    ? isDarkMode
      ? "#e57373"
      : "#d32f2f"
    : colors[(depth - 1) % colors.length];
  return {
    depth,
    color,
    indent: depth * 20,
    label: segments[segments.length - 1],
    isErrorFlow,
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
  const displayLabel = label.replace("⚠️ Error Handler", "");

  return (
    <div
      className={styles.pathWrapper}
      style={{
        marginLeft: `${indent}px`,
        paddingLeft: depth > 0 ? "24px" : "0",
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
