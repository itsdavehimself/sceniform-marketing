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
      {isGroupDisabled && (
        <span className={styles.disabledBadge}>🚫 DISABLED ROUTE</span>
      )}
    </div>
  );
};

export default PathHeader;
