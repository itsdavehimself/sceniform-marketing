import styles from "./SettingsSidebar.module.scss";

interface SettingsSidebarProps {
  ignoreScenarioName: boolean;
  setIgnoreScenarioName: (val: boolean) => void;
  ignoreConnections: boolean;
  setIgnoreConnections: (val: boolean) => void;
  ignoreModuleNames: boolean;
  setIgnoreModuleNames: (val: boolean) => void;
  showRawMappings: boolean;
  setShowRawMappings: (val: boolean) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  ignoreScenarioName,
  setIgnoreScenarioName,
  ignoreConnections,
  setIgnoreConnections,
  ignoreModuleNames,
  setIgnoreModuleNames,
  showRawMappings,
  setShowRawMappings,
}) => {
  return (
    <div className={styles.settingsSidebar}>
      <h3>Deployment Settings</h3>
      <div className={styles.settingToggles}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={ignoreScenarioName}
            onChange={(e) => setIgnoreScenarioName(e.target.checked)}
          />
          <span>Preserve Scenario Name</span>
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={ignoreModuleNames}
            onChange={(e) => setIgnoreModuleNames(e.target.checked)}
          />
          <span>Preserve Module Names</span>
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={ignoreConnections}
            onChange={(e) => setIgnoreConnections(e.target.checked)}
          />
          <span>Hide Connection Difference</span>
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={showRawMappings}
            onChange={(e) => setShowRawMappings(e.target.checked)}
          />
          <span>Show Raw Mappings</span>
        </label>
      </div>
    </div>
  );
};

export default SettingsSidebar;
