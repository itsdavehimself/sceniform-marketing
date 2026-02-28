import styles from "./Settings.module.scss";
import Section from "../../components/Section/Section";

const Settings: React.FC = () => {
  return (
    <main className={styles.settingsContainer}>
      <h1>Settings</h1>
      <Section header="General" children={<div>Logout</div>} />
    </main>
  );
};

export default Settings;
