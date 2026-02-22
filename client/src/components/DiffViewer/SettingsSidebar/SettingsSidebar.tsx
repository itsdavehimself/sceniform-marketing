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
            checked={ignoreScenarioName}
            onChange={(e) => setIgnoreScenarioName(e.target.checked)}
          />{" "}
          Ignore Scenario Name
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={ignoreConnections}
            onChange={(e) => setIgnoreConnections(e.target.checked)}
          />{" "}
          Ignore Connection IDs
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={ignoreModuleNames}
            onChange={(e) => setIgnoreModuleNames(e.target.checked)}
          />{" "}
          Ignore Module Renames
        </label>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showRawMappings}
            onChange={(e) => setShowRawMappings(e.target.checked)}
          />{" "}
          Show Raw Mappings
        </label>
      </div>
    </div>
  );
};

export default SettingsSidebar;
