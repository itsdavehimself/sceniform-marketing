import React from "react";
import styles from "./MappingRow.module.scss";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Dropdown, { type DropdownOption } from "../../../Dropdown/Dropdown";
import AppIcon from "../../../AppIcon/AppIcon";

interface MappingRowProps {
  conn: any;
  sourceConnections: any[];
  targetConnections: any[];
  currentMapping: string | number;
  isAutoMapped: boolean;
  onMappingChange: (sourceId: number, targetId: number) => void;
}

const MappingRow: React.FC<MappingRowProps> = ({
  conn,
  sourceConnections,
  targetConnections,
  currentMapping,
  isAutoMapped,
  onMappingChange,
}) => {
  // 1. Find the source connection details using the Source list
  const sourceConnDetails = sourceConnections.find(
    (c: any) => c.id === Number(conn.id),
  );

  const displayName = sourceConnDetails
    ? sourceConnDetails.name
    : "Unknown Connection";

  // 2. Filter target connections using the Target list
  const filteredConnections = targetConnections.filter((availableConn: any) => {
    if (sourceConnDetails && sourceConnDetails.accountName) {
      return availableConn.accountName === sourceConnDetails.accountName;
    }
    return true; // Fallback
  });

  // 3. Format the options for the custom Dropdown component
  const dropdownOptions: DropdownOption[] = filteredConnections.map(
    (availableConn: any) => ({
      label: availableConn.name,
      value: availableConn.id,
      icon: <AppIcon accountName={availableConn.accountName} size={16} />,
    }),
  );

  return (
    <div className={styles.mappingRow}>
      <div className={styles.sourceLabel}>
        <AppIcon accountName={sourceConnDetails?.accountName} size={16} />
        <span className={styles.primaryName}>{displayName}</span>
      </div>

      <div className={styles.arrowContainer}>
        <ArrowRight size={14} />
      </div>

      <div className={styles.dropdownWrapper}>
        <Dropdown
          options={dropdownOptions}
          value={currentMapping}
          onChange={(val) => onMappingChange(conn.id, Number(val))}
          placeholder="Select target connection"
          className={styles.dropdown}
        />
      </div>
      {isAutoMapped && (
        <div className={styles.autoBadge} title="Auto-matched">
          <CheckCircle2 size={18} strokeWidth={2.5} />
        </div>
      )}
    </div>
  );
};

export default MappingRow;
