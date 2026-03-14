import styles from "./DiffRow.module.scss";
import { getBrokenRefs } from "../../../../helpers/getBrokenRefs";
import BrokenBadge from "../../../BrokenBadge/BrokenBadge";
import SmartValue from "../SmartValue/SmartValue";
import BranchLogicDiffRow from "../BranchLogicDiffRow/BranchLogicDiffRow";
import MergeMappingDiffRow from "../MergeMappingDiffRow/MergeMappingDiffRow";

interface DiffRowProps {
  diff: any;
  wasLabel: string;
  becomesLabel: string;
  handleScrollToModule: (id: string | number) => void;
}

interface DiffRowProps {
  diff: any;
  wasLabel: string;
  becomesLabel: string;
  handleScrollToModule: (id: string | number) => void;
}

const DiffRow: React.FC<DiffRowProps> = ({
  diff,
  wasLabel,
  becomesLabel,
  handleScrollToModule,
}) => {
  // --- INTERCEPT BRANCH LOGIC ---
  if (diff.field.startsWith("branchLogic")) {
    return (
      <BranchLogicDiffRow
        diff={diff}
        wasLabel={wasLabel}
        becomesLabel={becomesLabel}
        handleScrollToModule={handleScrollToModule}
      />
    );
  }

  // --- NEW: INTERCEPT MERGE MAPPINGS ---
  if (diff.field === "mergeOutputs") {
    return (
      <MergeMappingDiffRow
        diff={diff}
        wasLabel={wasLabel}
        becomesLabel={becomesLabel}
        handleScrollToModule={handleScrollToModule}
      />
    );
  }
  const formatFieldKey = (key: string) =>
    key
      .split(".")
      .map((part) => {
        // Translate legacy architecture keys
        if (part === "__IMTCONN__") return "Connection";
        if (part === "account") return "Account";
        if (part === "connection") return "Connection";
        if (part === "hook") return "Webhook";

        // NEW: Translate the new flow control keys
        if (part === "branchLogic") return "Branch Logic";
        if (part === "mergeOutputs") return "Merge Mapping";
        if (part === "conditions") return "Conditions";

        return isNaN(Number(part)) ? part : `[${part}]`;
      })
      .join(" ➞ ");

  const brokenInNew = getBrokenRefs(diff.newValue);

  return (
    <div className={styles.diffRow}>
      <div className={styles.fieldLabel}>{formatFieldKey(diff.field)}</div>

      <div className={styles.comparisonContainer}>
        <div className={styles.oldValue}>
          <div className={styles.miniLabel}>{wasLabel}</div>
          <SmartValue
            value={diff.oldValue}
            handleScrollToModule={handleScrollToModule}
          />
        </div>

        <div className={styles.arrow}>➔</div>

        <div className={styles.newValue}>
          <div className={styles.miniLabel}>{becomesLabel}</div>

          <div className={styles.newValueContent}>
            <div className={styles.smartValueWrapper}>
              <SmartValue
                value={diff.newValue}
                handleScrollToModule={handleScrollToModule}
              />
            </div>

            {brokenInNew.length > 0 && (
              <div className={styles.brokenBadgesContainer}>
                {brokenInNew.map((id) => (
                  <BrokenBadge key={id} id={id} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiffRow;
