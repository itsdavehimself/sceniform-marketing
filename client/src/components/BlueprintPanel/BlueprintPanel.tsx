import React from "react";
import styles from "./BlueprintPanel.module.scss";
import ScenarioDropdown from "./ScenarioDropdown/ScenarioDropdown";
import SquareButton from "../SquareButton/SquareBotton";
import { RefreshCw } from "lucide-react";

interface BlueprintPanelProps {
  title: string;
  selectedId: string;
  scenarios: any[];
  jsonValue: string;
  isLoading: boolean;
  onSelectChange: (id: string) => void;
  onJsonChange: (val: string) => void;
  onRefresh: () => void;
}

const BlueprintPanel: React.FC<BlueprintPanelProps> = ({
  title,
  selectedId,
  scenarios,
  jsonValue,
  isLoading,
  onSelectChange,
  onJsonChange,
  onRefresh,
}) => {
  return (
    <div className={styles.column}>
      <h3 className={styles.colHeader}>{title}</h3>
      <div className={styles.controls}>
        <ScenarioDropdown
          folders={scenarios}
          selectedId={selectedId}
          onSelectChange={onSelectChange}
        />
        <SquareButton
          icon={<RefreshCw size={20} />}
          onClick={onRefresh}
          title="Refresh Scenario Blueprint"
        />
      </div>
    </div>
  );
};

export default BlueprintPanel;
