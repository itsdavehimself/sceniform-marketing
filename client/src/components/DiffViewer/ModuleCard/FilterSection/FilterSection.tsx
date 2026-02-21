import React from "react";
import styles from "./FilterSection.module.scss";
import { getBrokenRefs } from "../../../../helpers/getBrokenRefs";
import FilterConditions from "./FilterConditions/FilterConditions";
import FilterHeader from "./FilterHeader/FilterHeader";

interface FilterSectionProps {
  filterChange: any;
  incomingFrom: string;
  isDarkMode: boolean;
  handleScrollToModule: (id: string | number) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filterChange,
  incomingFrom,
  isDarkMode,
  handleScrollToModule,
}) => {
  if (!filterChange) return null;

  const isNew = filterChange.type === "ADDED";
  const isModified = filterChange.type === "MODIFIED";
  const filterData = isNew
    ? filterChange.newValue
    : filterChange.newValue || filterChange.oldValue;
  const isFallback = filterChange.isFallback;
  const label = filterData?.name || (isFallback ? "Fallback" : "Unnamed");
  const brokenRefs = getBrokenRefs(filterData);

  return (
    <div className={styles.filterSection}>
      <FilterHeader
        label={label}
        isFallback={isFallback}
        brokenRefs={brokenRefs}
        incomingFrom={incomingFrom}
        isDarkMode={isDarkMode}
      />

      {isModified ? (
        <div className={styles.modifiedContainer}>
          <div className={styles.previousLogic}>
            <div className={styles.miniLabel}>PREVIOUS LOGIC</div>
            <FilterConditions
              conditions={filterChange.oldValue?.conditions}
              isDarkMode={isDarkMode}
              handleScrollToModule={handleScrollToModule}
            />
          </div>

          <div className={styles.divider}></div>

          <div className={styles.newLogic}>
            <div className={styles.miniLabel}>NEW LOGIC</div>
            <FilterConditions
              conditions={filterChange.newValue?.conditions}
              isDarkMode={isDarkMode}
              handleScrollToModule={handleScrollToModule}
            />
          </div>
        </div>
      ) : (
        <div>
          <FilterConditions
            conditions={filterData?.conditions}
            isDarkMode={isDarkMode}
            handleScrollToModule={handleScrollToModule}
          />
        </div>
      )}
    </div>
  );
};

export default FilterSection;
