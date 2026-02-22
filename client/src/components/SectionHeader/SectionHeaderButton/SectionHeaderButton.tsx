import styles from "./SectionHeaderButton.module.scss";

interface SectionHeaderButtonProps {
  title: string;
  onClick: () => void;
  isActive?: boolean;
}

const SectionHeaderButton: React.FC<SectionHeaderButtonProps> = ({
  title,
  onClick,
  isActive,
}) => {
  return (
    <button
      onClick={onClick}
      className={`${styles.sectionHeaderButton} ${isActive ? styles.active : ""}`}
      type="button"
    >
      {title}
    </button>
  );
};

export default SectionHeaderButton;
