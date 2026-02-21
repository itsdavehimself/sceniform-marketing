import React from "react";
import styles from "./BlueprintPanel.module.scss";

interface BlueprintPanelProps {
  title: string;
  selectedId: string;
  scenarios: any[];
  jsonValue: string;
  isLoading: boolean;
  onSelectChange: (id: string) => void;
  onFetch: () => void;
  onJsonChange: (val: string) => void;
}

const BlueprintPanel: React.FC<BlueprintPanelProps> = ({
  title,
  selectedId,
  scenarios,
  jsonValue,
  isLoading,
  onSelectChange,
  onFetch,
  onJsonChange,
}) => {
  return (
    <div className={styles.column}>
      <h3 className={styles.colHeader}>{title}</h3>
      <div className={styles.controls}>
        <select
          className={styles.selectBox}
          value={selectedId}
          onChange={(e) => onSelectChange(e.target.value)}
        >
          <option value="">-- Select Scenario --</option>
          {scenarios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          onClick={onFetch}
          className={styles.actionBtn}
          disabled={isLoading}
        >
          {isLoading ? "⏳" : "Load"}
        </button>
      </div>
      <textarea
        className={styles.textArea}
        value={jsonValue}
        onChange={(e) => onJsonChange(e.target.value)}
        placeholder="Load a Blueprint"
      />
    </div>
  );
};

export default BlueprintPanel;
