import styles from "./FilterHeader.module.scss";
import BrokenBadge from "../../../../BrokenBadge/BrokenBadge";

interface FilterHeaderProps {
  label: string;
  isFallback: boolean;
  brokenRefs: string[];
  incomingFrom: string;
  isDarkMode: boolean;
}

const FilterHeader: React.FC<FilterHeaderProps> = ({
  label,
  isFallback,
  brokenRefs,
  incomingFrom,
}) => {
  return (
    <div className={styles.filterHeader}>
      <div className={styles.titleContainer}>
        <span className={styles.icon}>⚡</span>
        <strong>FILTER: {label}</strong>
        {isFallback && (
          <span className={styles.fallbackBadge}>🔀 Fallback</span>
        )}
      </div>

      <div className={styles.metaContainer}>
        {brokenRefs.length > 0 &&
          brokenRefs.map((id) => <BrokenBadge key={id} id={id} />)}

        <div className={styles.bundleSource}>
          <span className={styles.bundleSourceLabel}>Bundle flows from:</span>{" "}
          {incomingFrom}
        </div>
      </div>
    </div>
  );
};

export default FilterHeader;
