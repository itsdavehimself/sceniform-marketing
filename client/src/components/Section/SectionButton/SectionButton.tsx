import React from "react";
import type { LucideIcon } from "lucide-react";
import styles from "./SectionButton.module.scss";

interface SectionButtonProps {
  title: string;
  icon?: LucideIcon;
  onClick: () => void;
}

const SectionButton: React.FC<SectionButtonProps> = ({
  title,
  icon: Icon,
  onClick,
}) => {
  return (
    <section className={styles.sectionButtonContainer}>
      <button onClick={onClick} className={styles.sectionButton}>
        {Icon && <Icon size={14} className={styles.icon} />}
        <span>{title}</span>
      </button>
    </section>
  );
};

export default SectionButton;
