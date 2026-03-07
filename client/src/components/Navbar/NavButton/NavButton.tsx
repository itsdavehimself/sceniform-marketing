import styles from "./NavButton.module.scss";

interface NavButtonProps {
  title: string;
  onClick?: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ title, onClick }) => {
  return (
    <button className={styles.navButton} onClick={onClick}>
      {title}
    </button>
  );
};

export default NavButton;
