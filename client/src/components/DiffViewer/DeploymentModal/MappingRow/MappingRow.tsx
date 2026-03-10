import React from "react";
import styles from "./MappingRow.module.scss";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Dropdown, { type DropdownOption } from "../../../Dropdown/Dropdown";
import AppIcon from "../../../AppIcon/AppIcon";

interface MappingRowProps {
  entity: any;
  type: "connection" | "hook";
  sourceList: any[];
  targetList: any[];
  currentMapping: string | number;
  isAutoMapped: boolean;
  onMappingChange: (sourceId: number, targetId: number) => void;
  targetScenarioId?: string | number; // <-- NEW PROP
}

const MappingRow: React.FC<MappingRowProps> = ({
  entity,
  type,
  sourceList,
  targetList,
  currentMapping,
  isAutoMapped,
  onMappingChange,
  targetScenarioId,
}) => {
  // 1. Find the source details
  const sourceDetails = sourceList.find((i: any) => i.id === Number(entity.id));

  const displayName = sourceDetails
    ? sourceDetails.name
    : `Unknown ${type === "hook" ? "Webhook" : "Connection"}`;

  // 2. Filter valid targets
  const filteredTargets = targetList.filter((availableItem: any) => {
    // --- AVAILABILITY CHECK ---
    // Make sure it isn't assigned to a DIFFERENT scenario.
    // If it has a scenarioId, it is only valid if it belongs to the scenario we are deploying to
    // OR if it happens to be the currently selected/auto-mapped value.
    if (availableItem.scenarioId && availableItem.id !== currentMapping) {
      if (
        !targetScenarioId ||
        String(availableItem.scenarioId) !== String(targetScenarioId)
      ) {
        return false;
      }
    }

    if (!sourceDetails) return true;

    // --- TYPE / ACCOUNT MATCHING ---
    if (type === "connection" && sourceDetails.accountName) {
      return availableItem.accountName === sourceDetails.accountName;
    }

    if (type === "hook" && sourceDetails.typeName) {
      return availableItem.typeName === sourceDetails.typeName;
    }

    return true;
  });

  // 3. Format Dropdown options
  const dropdownOptions: DropdownOption[] = filteredTargets.map(
    (availableItem: any) => ({
      label: availableItem.name,
      value: availableItem.id,
      icon: (
        <AppIcon
          accountName={availableItem.accountName}
          size={16}
          type={type}
        />
      ),
    }),
  );

  return (
    <div className={styles.mappingRow}>
      <div className={styles.sourceLabel}>
        <AppIcon
          accountName={sourceDetails?.accountName}
          size={16}
          type={type}
        />
        <span className={styles.primaryName}>{displayName}</span>
      </div>

      <div className={styles.arrowContainer}>
        <ArrowRight size={14} />
      </div>

      <div className={styles.dropdownWrapper}>
        <Dropdown
          options={dropdownOptions}
          value={currentMapping}
          onChange={(val) => onMappingChange(entity.id, Number(val))}
          placeholder={`Select target ${type}`}
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
