import styles from "./PathHeader.module.scss";

interface PathHeaderProps {
  path: string;
  label: string;
  displayLabel: string;
  depth: number;
  color: string;
  isRootPath: boolean;
  isPathCollapsed: boolean;
  isErrorFlow: boolean;
  isBranchFlow: boolean;
  isMergedFlow?: boolean;
  isGroupDisabled: boolean;
  togglePathCollapse: (path: string) => void;
}

const PathHeader: React.FC<PathHeaderProps> = ({
  path,
  label,
  displayLabel,
  depth,
  color,
  isRootPath,
  isPathCollapsed,
  isErrorFlow,
  isBranchFlow,
  isMergedFlow,
  isGroupDisabled,
  togglePathCollapse,
}) => {
  // Inject the dynamic color as a CSS variable
  const customStyles = {
    "--path-header-color": depth > 0 ? color : "#999",
  } as React.CSSProperties;

  const classes = [styles.pathHeader, isRootPath ? styles.isRoot : ""]
    .join(" ")
    .trim();

  const toggleClasses = [
    styles.toggleIcon,
    isPathCollapsed ? styles.collapsed : "",
  ]
    .join(" ")
    .trim();

  return (
    <div
      onClick={() => !isRootPath && togglePathCollapse(path)}
      className={classes}
      style={customStyles}
    >
      {!isRootPath && <span className={toggleClasses}>▼</span>}

      <span>
        {depth > 0 && <span className={styles.depthArrow}>↳</span>}
        {depth > 0 ? displayLabel : `📂 ${label}`}
      </span>

      {isErrorFlow && <span className={styles.errorBadge}>⚡ ERROR FLOW</span>}
      {isBranchFlow && (
        <span
          className={styles.branchBadge}
          style={{
            fontSize: "0.75rem",
            padding: "2px 6px",
            background: "rgba(63, 81, 181, 0.15)",
            color: color,
            borderRadius: "4px",
            marginLeft: "8px",
            fontWeight: "bold",
          }}
        >
          🔀 IF-ELSE BRANCH
        </span>
      )}

      {/* NEW BADGE */}
      {isMergedFlow && (
        <span
          className={styles.branchBadge}
          style={{
            fontSize: "0.75rem",
            padding: "2px 6px",
            background: "rgba(0, 137, 123, 0.15)",
            color: color,
            borderRadius: "4px",
            marginLeft: "8px",
            fontWeight: "bold",
          }}
        >
          🔗 MERGED FLOW
        </span>
      )}

      {isGroupDisabled && (
        <span className={styles.disabledBadge}>🚫 DISABLED ROUTE</span>
      )}
    </div>
  );
};

export default PathHeader;
