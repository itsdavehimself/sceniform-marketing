import styles from "./OverviewSidebar.module.scss";
import {
  Plus,
  Minus,
  ArrowLeftRight,
  Check,
  AlertTriangle,
} from "lucide-react";

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
        {diffReport ? (
          <>
            <div className={`${styles.badge} ${styles.removed}`}>
              <Minus size={14} strokeWidth={2.5} />
              <span>{diffReport?.summary?.removed ?? 0} Removed</span>
            </div>

            <div className={`${styles.badge} ${styles.added}`}>
              <Plus size={14} strokeWidth={2.5} />
              <span>{diffReport?.summary?.added ?? 0} Added</span>
            </div>

            <div className={`${styles.badge} ${styles.modified}`}>
              <ArrowLeftRight size={14} strokeWidth={2.5} />
              <span>{diffReport?.summary?.modified ?? 0} Modified</span>
            </div>

            {errorStats?.refCount > 0 ? (
              <div
                onClick={() => setShowErrorsOnly(!showErrorsOnly)}
                className={`${styles.badge} ${styles.errorToggle} ${
                  showErrorsOnly ? styles.active : ""
                }`}
              >
                <AlertTriangle size={14} strokeWidth={2.5} />
                <span>
                  {errorStats.moduleCount} Modules / {errorStats.refCount}{" "}
                  Broken Refs
                </span>
              </div>
            ) : (
              <div className={`${styles.badge} ${styles.neutral}`}>
                <Check size={14} strokeWidth={2.5} />
                <span>0 Reference Errors</span>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noDiffMessageContainer}>
            <p className={styles.noDiffMessage}>
              Load blueprints to see overview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewSidebar;
