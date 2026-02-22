import NavButton from "./NavButton/NavButton";
import styles from "./Navbar.module.scss";

const Navbar: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.navGroup}>
          <NavButton title="Product" />
          <NavButton title="About" />
          <NavButton title="Pricing" />
        </div>
        <div className={styles.navGroup}>
          <button>Login</button>
          <button>Sign Up</button>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
