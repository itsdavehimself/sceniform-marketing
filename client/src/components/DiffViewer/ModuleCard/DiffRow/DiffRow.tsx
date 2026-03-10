import styles from "./DiffRow.module.scss";
import { getBrokenRefs } from "../../../../helpers/getBrokenRefs";
import BrokenBadge from "../../../BrokenBadge/BrokenBadge";
import SmartValue from "../SmartValue/SmartValue";

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
  const formatFieldKey = (key: string) =>
    key
      .split(".")
      .map((part) => {
        // Translate ugly Make.com architecture keys to UI friendly names
        if (part === "__IMTCONN__") return "Connection";
        if (part === "account") return "Account";
        if (part === "connection") return "Connection";
        if (part === "hook") return "Webhook";

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
