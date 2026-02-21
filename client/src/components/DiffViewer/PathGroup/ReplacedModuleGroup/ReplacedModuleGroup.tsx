import styles from "./ReplacedModuleGroup.module.scss";
import ModuleCard from "../../ModuleCard/ModuleCard";

interface ReplacedModuleGroupProps {
  item: any;
  isDarkMode: boolean;
  highlightedModuleId: string | number | null;
  collapsedIds: Set<string | number>;
  errorStats: any;
  wasLabel: string;
  becomesLabel: string;
  toggleCollapse: (id: string | number) => void;
  handleScrollToModule: (id: string | number) => void;
}

const ReplacedModuleGroup: React.FC<ReplacedModuleGroupProps> = ({
  item,
  isDarkMode,
  highlightedModuleId,
  collapsedIds,
  errorStats,
  wasLabel,
  becomesLabel,
  toggleCollapse,
  handleScrollToModule,
}) => {
  return (
    <div className={styles.replacementWrapper}>
      <div className={styles.replacementHeader}>
        <strong>🔄 Module Replaced</strong>
        <span style={{ fontSize: "11px", opacity: 0.8 }}>
          ID: {item.moduleId}
        </span>
      </div>

      <div style={{ opacity: 0.7 }}>
        <ModuleCard
          change={item.oldChange}
          isNested={true}
          isDarkMode={isDarkMode}
          isHighlighted={highlightedModuleId == item.oldChange.moduleId}
          isCollapsed={collapsedIds.has(item.oldChange.moduleId)}
          hasError={errorStats.errorModuleIds.has(item.oldChange.moduleId)}
          onToggle={() => toggleCollapse(item.oldChange.moduleId)}
          wasLabel={wasLabel}
          becomesLabel={becomesLabel}
          handleScrollToModule={handleScrollToModule}
        />
      </div>

      <div className={styles.replacementArrow}>⬇️ Replaced By ⬇️</div>

      <div>
        <ModuleCard
          change={item.newChange}
          isNested={true}
          isDarkMode={isDarkMode}
          isHighlighted={highlightedModuleId == item.newChange.moduleId}
          isCollapsed={collapsedIds.has(item.newChange.moduleId)}
          hasError={errorStats.errorModuleIds.has(item.newChange.moduleId)}
          onToggle={() => toggleCollapse(item.newChange.moduleId)}
          wasLabel={wasLabel}
          becomesLabel={becomesLabel}
          handleScrollToModule={handleScrollToModule}
        />
      </div>
    </div>
  );
};

export default ReplacedModuleGroup;
