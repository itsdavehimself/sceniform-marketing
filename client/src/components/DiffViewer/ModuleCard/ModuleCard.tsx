import React from "react";
import styles from "./ModuleCard.module.scss";
import CardHeader from "./CardHeader/CardHeader";
import FilterSection from "./FilterSection/FilterSection";
import DiffRow from "./DiffRow/DiffRow";

interface ModuleCardProps {
  change: any;
  isNested?: boolean;
  isDarkMode: boolean;
  isHighlighted: boolean;
  isCollapsed: boolean;
  hasError: boolean;
  onToggle: () => void;
  wasLabel: string;
  becomesLabel: string;
  handleScrollToModule: (id: string | number) => void;
}

const ModuleCard: React.FC<ModuleCardProps> = ({
  change,
  isNested = false,
  isDarkMode,
  isHighlighted,
  isCollapsed,
  hasError,
  onToggle,
  wasLabel,
  becomesLabel,
  handleScrollToModule,
}) => {
  const isDisabledRoute = change.isDisabled === true;

  const cardClasses = [
    styles.card,
    isNested ? styles.isNested : "",
    isHighlighted ? styles.isHighlighted : "",
    hasError ? styles.hasError : "",
    isDisabledRoute ? styles.isDisabled : "",
  ]
    .join(" ")
    .trim();

  return (
    <div id={`module-card-${change.moduleId}`} className={cardClasses}>
      <CardHeader
        change={change}
        isCollapsed={isCollapsed}
        isHighlighted={isHighlighted}
        hasError={hasError}
        isDisabledRoute={isDisabledRoute}
        isDarkMode={isDarkMode}
        onToggle={onToggle}
      />

      {!isCollapsed && (
        <>
          {change.filterChange && (
            <FilterSection
              filterChange={change.filterChange}
              incomingFrom={change.incomingFrom}
              isDarkMode={isDarkMode}
              handleScrollToModule={handleScrollToModule}
            />
          )}
          <div className={styles.cardBody}>
            {change.details && (
              <div className={styles.details}>{change.details}</div>
            )}
            {change.changes &&
              change.changes.map((diff: any, i: number) => (
                <DiffRow
                  key={i}
                  diff={diff}
                  wasLabel={wasLabel}
                  becomesLabel={becomesLabel}
                  handleScrollToModule={handleScrollToModule}
                />
              ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ModuleCard;
