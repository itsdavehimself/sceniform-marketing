import styles from "./CardHeader.module.scss";
import { getBrokenRefs } from "../../../../helpers/getBrokenRefs";

interface CardHeaderProps {
  change: any;
  isCollapsed: boolean;
  isHighlighted: boolean;
  hasError: boolean;
  isDisabledRoute: boolean;
  isDarkMode: boolean;
  onToggle: () => void;
}

const CardHeader: React.FC<CardHeaderProps> = ({
  change,
  isCollapsed,
  isHighlighted,
  hasError,
  isDisabledRoute,
  onToggle,
}) => {
  const headerClasses = [
    styles.cardHeader,
    isCollapsed ? styles.isCollapsed : "",
    isHighlighted ? styles.isHighlighted : "",
    hasError ? styles.hasError : "",
  ]
    .join(" ")
    .trim();

  const toggleClasses = [
    styles.toggleIcon,
    isCollapsed ? styles.isCollapsed : "",
  ]
    .join(" ")
    .trim();

  // Determine the correct CSS class for the status text
  let statusClass = styles.modified;
  if (change.type === "ADDED") statusClass = styles.added;
  if (change.type === "REMOVED") statusClass = styles.removed;

  return (
    <div onClick={onToggle} className={headerClasses}>
      <div className={styles.contentWrapper}>
        <div className={styles.titleRow}>
          <span className={toggleClasses}>▼</span>

          <span className={styles.typeIcon}>
            {change.type === "ADDED"
              ? "🟢"
              : change.type === "REMOVED"
                ? "🔴"
                : "✏️"}
          </span>

          <strong className={styles.moduleName}>{change.module}</strong>

          <span className={styles.badge}>{change.moduleType}</span>

          {isDisabledRoute && (
            <span className={styles.disabledBadge}>🚫 DISABLED</span>
          )}

          {hasError && (
            <span className={styles.errorBadge}>
              {getBrokenRefs(JSON.stringify(change)).length} ERRORS
            </span>
          )}
        </div>

        <div className={styles.metaRow}>
          <span title="Module ID">🆔 {change.moduleId}</span>
          {change.moduleName && (
            <span title="Raw Metadata Name">🏷️ {change.moduleName}</span>
          )}
        </div>
      </div>

      <div className={`${styles.statusLabel} ${statusClass}`}>
        {change.type}
      </div>
    </div>
  );
};

export default CardHeader;
