import React from "react";
import styles from "./BrokenBadge.module.scss";

interface BrokenBadgeProps {
  id: string | number;
}

const BrokenBadge: React.FC<BrokenBadgeProps> = ({ id }) => (
  <span
    className={styles.brokenBadge}
    title="This reference ID is missing in the current blueprint context"
  >
    ⚠️ BROKEN REFERENCE ID: {id}
  </span>
);

export default BrokenBadge;
