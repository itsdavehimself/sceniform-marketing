import React from "react";
import styles from "./OverviewSidebar.module.scss";
import { Plus, Minus, ArrowLeftRight, Check } from "lucide-react";

interface OverviewSidebarProps {
  diffReport: any;
  errorStats: { moduleCount: number; refCount: number };
  showErrorsOnly: boolean;
  setShowErrorsOnly: (val: boolean) => void;
}

const OverviewSidebar: React.FC<OverviewSidebarProps> = ({
  diffReport,
  errorStats,
  showErrorsOnly,
  setShowErrorsOnly,
}) => {
  return (
    <div className={styles.overviewSidebar}>
      <h3>Overview</h3>
      <div className={styles.statsContainer}>
        <div className={styles.statRemoved}>
          <Minus size={14} />
          <div>{diffReport?.summary?.removed ?? 0} Removed</div>
        </div>
        <div className={styles.statAdded}>
          <Plus size={14} /> <div>{diffReport?.summary?.added ?? 0} Added</div>
        </div>
        <div className={styles.statModified}>
          <ArrowLeftRight size={14} />{" "}
          <div>{diffReport?.summary?.modified ?? 0} Modified</div>
        </div>

        {errorStats?.refCount > 0 ? (
          <div
            onClick={() => setShowErrorsOnly(!showErrorsOnly)}
            className={`${styles.errorToggle} ${showErrorsOnly ? styles.active : styles.inactive}`}
          >
            <span className={styles.errorToggleText}>
              ⚠️ {errorStats.moduleCount} Modules / {errorStats.refCount} Broken
              Refs
            </span>
            <span className={styles.errorToggleLink}>
              {showErrorsOnly ? "Show All" : "Filter Errors"}
            </span>
          </div>
        ) : (
          <div className={styles.noErrors}>
            <Check size={14} /> <div>0 Reference Errors</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewSidebar;
