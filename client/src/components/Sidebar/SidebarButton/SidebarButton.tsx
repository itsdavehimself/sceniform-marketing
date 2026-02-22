import styles from "./SidebarButton.module.scss";
import { type LucideIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

interface SidebarButtonProps {
  title: string;
  path: string;
  icon: LucideIcon;
  navigation: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({
  title,
  path,
  icon: Icon,
  navigation,
}) => {
  const location = useLocation();
  const isActive = location.pathname.includes(path);

  return (
    <button
      className={`${styles.sidebarButton} ${isActive ? styles.active : ""}`}
      onClick={navigation}
    >
      <span className={styles.iconWrapper}>
        <Icon size={18} />
      </span>
      <span className={styles.title}>{title}</span>
    </button>
  );
};

export default SidebarButton;
