import styles from "./SectionItem.module.scss";
import type { PropsWithChildren } from "react";

interface SectionItemProps {
  title: string;
  description: string;
}

const SectionItem: React.FC<PropsWithChildren<SectionItemProps>> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className={styles.sectionItem}>
      <div className={styles.sectionText}>
        <p className={styles.sectionTitle}>{title}</p>
        <p className={styles.sectionDescription}>{description}</p>
      </div>
      <div className={styles.sectionChildren}>{children}</div>
    </div>
  );
};

export default SectionItem;
