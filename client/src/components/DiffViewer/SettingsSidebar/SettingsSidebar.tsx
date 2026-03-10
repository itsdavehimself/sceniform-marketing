import styles from "./SettingsSidebar.module.scss";

interface SettingsSidebarProps {
  ignoreScenarioName: boolean;
  setIgnoreScenarioName: (val: boolean) => void;
  ignoreConnections: boolean;
  setIgnoreConnections: (val: boolean) => void;
  ignoreHooks: boolean;
  setIgnoreHooks: (val: boolean) => void;
  ignoreModuleNames: boolean;
  setIgnoreModuleNames: (val: boolean) => void;
  showRawMappings: boolean;
  setShowRawMappings: (val: boolean) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (val: boolean) => void;
  showErrorsOnly?: boolean;
  setShowErrorsOnly?: (val: boolean) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  ignoreScenarioName,
  setIgnoreScenarioName,
  ignoreConnections,
  setIgnoreConnections,
  ignoreHooks,
  setIgnoreHooks,
  ignoreModuleNames,
  setIgnoreModuleNames,
  showRawMappings,
  setShowRawMappings,
  // Included other props based on how it's called in Scenarios.tsx
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
            checked={ignoreHooks}
            onChange={(e) => setIgnoreHooks(e.target.checked)}
          />
          <span>Hide Hook Difference</span>
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
