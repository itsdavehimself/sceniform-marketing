import styles from "./SectionMultiItem.module.scss";
import type { PropsWithChildren } from "react";

interface SectionMultiItem {
  title: string;
  description: string;
}

const SectionMultiItem: React.FC<PropsWithChildren<SectionMultiItem>> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className={styles.multiItem}>
      <div className={styles.header}>
        <h5>{title}</h5>
        <p className={styles.description}>{description}</p>
      </div>
      <div className={styles.children}>{children}</div>
    </div>
  );
};

export default SectionMultiItem;
