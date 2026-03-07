import type { LucideIcon } from "lucide-react";
import styles from "./FeatureGridItem.module.scss";

interface FeatureGridItemProps {
  title: string;
  text: string;
  icon: LucideIcon;
}

const FeatureGridItem: React.FC<FeatureGridItemProps> = ({
  title,
  text,
  icon: Icon,
}) => {
  return (
    <div className={styles.feature}>
      <div className={styles.featureHeader}>
        <Icon size={24} className={styles.icon} />
        <h4>{title}</h4>
      </div>
      <p className={styles.featureText}>{text}</p>
    </div>
  );
};

export default FeatureGridItem;
