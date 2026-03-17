import React from "react";
import styles from "./ChangeBadge.module.scss";

export type ChangeType = "feature" | "bugfix" | "improvement" | "security";

interface ChangeBadgeProps {
  type: ChangeType;
}

const ChangeBadge: React.FC<ChangeBadgeProps> = ({ type }) => {
  return <span className={`${styles.badge} ${styles[type]}`}>{type}</span>;
};

export default ChangeBadge;
