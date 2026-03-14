// src/components/DiffViewer/ModuleCard/BranchLogicDiffRow/BranchLogicDiffRow.tsx

import React from "react";
import styles from "./BranchLogicDiffRow.module.scss";
import FilterConditions from "../FilterSection/FilterConditions/FilterConditions";

interface BranchLogicDiffRowProps {
  diff: any;
  wasLabel: string;
  becomesLabel: string;
  handleScrollToModule: (id: string | number) => void;
}

const BranchLogicDiffRow: React.FC<BranchLogicDiffRowProps> = ({
  diff,
  wasLabel,
  becomesLabel,
  handleScrollToModule,
}) => {
  // 1. Reconstruct the branch logic objects safely
  let oldBranches: Record<string, any> = {};
  let newBranches: Record<string, any> = {};

  if (diff.field === "branchLogic") {
    oldBranches = diff.oldValue || {};
    newBranches = diff.newValue || {};
  } else if (diff.field.startsWith("branchLogic.")) {
    const prefix = "branchLogic.";
    const remainder = diff.field.slice(prefix.length);

    let branchName = remainder;
    let subField = "";

    if (remainder.endsWith(".conditions")) {
      branchName = remainder.slice(0, -".conditions".length);
      subField = "conditions";
    } else if (remainder.endsWith(".type")) {
      branchName = remainder.slice(0, -".type".length);
      subField = "type";
    }

    if (subField === "conditions") {
      oldBranches[branchName] = {
        type: "condition",
        conditions: diff.oldValue,
      };
      newBranches[branchName] = {
        type: "condition",
        conditions: diff.newValue,
      };
    } else if (subField === "type") {
      oldBranches[branchName] = { type: diff.oldValue, conditions: [] };
      newBranches[branchName] = { type: diff.newValue, conditions: [] };
    } else {
      oldBranches[branchName] = diff.oldValue || {};
      newBranches[branchName] = diff.newValue || {};
    }
  }

  // 2. Extract unique branch names
  const allBranchKeys = Array.from(
    new Set([...Object.keys(oldBranches), ...Object.keys(newBranches)]),
  );

  return (
    <div className={styles.container}>
      <div className={styles.mainLabel}>Branch Logic</div>

      <div className={styles.branchesList}>
        {allBranchKeys.map((key) => {
          const oldBranch = oldBranches[key];
          const newBranch = newBranches[key];
          const type = newBranch?.type || oldBranch?.type || "unknown";

          return (
            <div key={key} className={styles.branchBox}>
              <div className={styles.branchHeader}>
                <span className={styles.branchName}>{key}</span>
                <span className={styles.branchTypeBadge}>{type}</span>
              </div>

              {/* SIDE BY SIDE COMPARISON */}
              <div className={styles.comparisonContainer}>
                {/* PROD (OLD) SIDE */}
                <div className={styles.oldValue}>
                  <div className={styles.miniLabel}>{wasLabel}</div>
                  {oldBranch ? (
                    oldBranch.conditions && oldBranch.conditions.length > 0 ? (
                      <FilterConditions
                        conditions={oldBranch.conditions}
                        isDarkMode={false}
                        handleScrollToModule={handleScrollToModule}
                      />
                    ) : (
                      <span className={styles.noLogic}>
                        No conditions defined
                      </span>
                    )
                  ) : (
                    <span className={styles.noLogic}>Branch did not exist</span>
                  )}
                </div>

                <div className={styles.arrow}>➔</div>

                {/* SANDBOX (NEW) SIDE */}
                <div className={styles.newValue}>
                  <div className={styles.miniLabel}>{becomesLabel}</div>
                  {newBranch ? (
                    newBranch.conditions && newBranch.conditions.length > 0 ? (
                      <FilterConditions
                        conditions={newBranch.conditions}
                        isDarkMode={false}
                        handleScrollToModule={handleScrollToModule}
                      />
                    ) : (
                      <span className={styles.noLogic}>
                        No conditions defined
                      </span>
                    )
                  ) : (
                    <span className={styles.noLogic}>Branch removed</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BranchLogicDiffRow;
