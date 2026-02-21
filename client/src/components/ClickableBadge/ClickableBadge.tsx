import styles from "./ClickableBadge.module.scss";

interface ClickableBadgeProps {
  id: string;
  label: string;
  isRaw: boolean;
  handleScrollToModule: (id: string) => void;
}

const ClickableBadge: React.FC<ClickableBadgeProps> = ({
  id,
  label,
  isRaw,
  handleScrollToModule,
}) => (
  <span
    onClick={(e) => {
      e.stopPropagation();
      handleScrollToModule(id);
    }}
    title={`Scroll to Module ID:${id}`}
    className={`${styles.clickableBadge} ${isRaw ? styles.isRaw : ""}`}
  >
    <span style={{ marginRight: "3px" }}>🔗</span>
    {label}
  </span>
);

export default ClickableBadge;
