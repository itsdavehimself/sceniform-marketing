import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import NavButton from "./NavButton/NavButton";
import styles from "./Navbar.module.scss";
import ActionButton from "../ActionButton/ActionButton";
import logo from "../../assets/sceniform-logo.png";

const Navbar: React.FC = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.navbar}>
        <div className={styles.navLogoGroup}>
          <div className={styles.branding}>
            <img className={styles.logo} src={logo}></img>Sceniform
          </div>
          <div className={styles.navGroup}>
            <NavButton title="Product" />
            <NavButton title="About" />
            <NavButton title="Pricing" />
          </div>
        </div>
        <div className={styles.authGroup}>
          <SignInButton forceRedirectUrl={"/scenarios"}>
            <ActionButton title="Sign In" variant="secondary" />
          </SignInButton>
          <SignUpButton forceRedirectUrl={"/scenarios"}>
            <ActionButton title="Sign Up" variant="primary" />
          </SignUpButton>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
