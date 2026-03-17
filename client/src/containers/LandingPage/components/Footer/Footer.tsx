import styles from "./Footer.module.scss";
import logo from "../../../../assets/sceniform-logo.png";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.logoContainer}>
        <img className={styles.footerLogo} src={logo} alt="Sceniform Logo" />
      </div>
      <div className={styles.linkContainers}>
        <div className={styles.linkGroup}>
          <h5 className={styles.linkGroupHeader}>Legal</h5>
          <div className={styles.links}>
            <a href="/privacy">Privacy</a>
            <a href="/tos">Terms of Service</a>
          </div>
        </div>
        <div className={styles.linkGroup}>
          <h5 className={styles.linkGroupHeader}>Support</h5>
          <div className={styles.links}>
            <a href="mailto:support@sceniform.com">Contact</a>
          </div>
        </div>
        <div className={styles.linkGroup}>
          <h5 className={styles.linkGroupHeader}>Resources</h5>
          <div className={styles.links}>
            <a href="/pricing">Pricing</a>
            <a href="/changelog">Changelog</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
