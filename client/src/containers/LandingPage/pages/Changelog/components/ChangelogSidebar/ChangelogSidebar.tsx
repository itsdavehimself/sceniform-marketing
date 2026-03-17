import React from "react";
import styles from "./ChangelogSidebar.module.scss";

interface ChangelogSidebarProps {
  months: string[];
}

const ChangelogSidebar: React.FC<ChangelogSidebarProps> = ({ months }) => {
  return (
    <aside className={styles.sidebar}>
      <h3 className={styles.sidebarTitle}>Timeline</h3>
      <ul className={styles.monthList}>
        {months.map((month) => {
          const anchorId = month.toLowerCase().replace(/\s+/g, "-");
          return (
            <li key={month}>
              <a href={`#${anchorId}`} className={styles.monthLink}>
                {month}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default ChangelogSidebar;
