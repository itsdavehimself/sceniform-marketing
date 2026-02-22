import styles from "./NavButton.module.scss";

interface NavButtonProps {
  title: string;
}

const NavButton: React.FC<NavButtonProps> = ({ title }) => {
  return <button className={styles.navButton}>{title}</button>;
};
export default NavButton;
