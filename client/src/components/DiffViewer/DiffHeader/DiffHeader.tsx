import styles from "./DiffHeader.module.scss";

interface DiffHeaderProps {
  diffReport: any;
  errorStats: { moduleCount: number; refCount: number };
  showErrorsOnly: boolean;
  setShowErrorsOnly: (val: boolean) => void;
}

const DiffHeader: React.FC<DiffHeaderProps> = ({
  diffReport,
  errorStats,
  showErrorsOnly,
  setShowErrorsOnly,
}) => {
  return (
    <>
      <h3 className={styles.colHeader}>2. Change Set</h3>
      {diffReport && (
        <div className={styles.statsBar}>
          <span className={styles.statRemoved}>
            ➖ {diffReport.summary.removed} Removed
          </span>
          <span className={styles.statAdded}>
            ➕ {diffReport.summary.added} Added
          </span>
          <span className={styles.statModified}>
            ✏️ {diffReport.summary.modified} Modified
          </span>

          <div className={styles.divider} />

          {errorStats.refCount > 0 ? (
            <div
              onClick={() => setShowErrorsOnly(!showErrorsOnly)}
              className={`${styles.errorToggle} ${showErrorsOnly ? styles.active : styles.inactive}`}
            >
              <span className={styles.errorToggleText}>
                ⚠️ {errorStats.moduleCount} Modules / {errorStats.refCount}{" "}
                Broken Refs
              </span>
              <span className={styles.errorToggleLink}>
                {showErrorsOnly ? "Show All" : "Filter Errors"}
              </span>
            </div>
          ) : (
            <span className={styles.noErrors}>✅ No Reference Errors</span>
          )}
        </div>
      )}
    </>
  );
};

export default DiffHeader;
