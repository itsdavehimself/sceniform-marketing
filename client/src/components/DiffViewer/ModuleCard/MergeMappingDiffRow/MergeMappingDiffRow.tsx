// src/components/DiffViewer/ModuleCard/MergeMappingDiffRow/MergeMappingDiffRow.tsx

import React from "react";
import styles from "./MergeMappingDiffRow.module.scss";
import SmartValue from "../SmartValue/SmartValue";

interface MergeMappingDiffRowProps {
  diff: any;
  wasLabel: string;
  becomesLabel: string;
  handleScrollToModule: (id: string | number) => void;
}

const MergeMappingDiffRow: React.FC<MergeMappingDiffRowProps> = ({
  diff,
  wasLabel,
  becomesLabel,
  handleScrollToModule,
}) => {
  // Extract and normalize the output arrays
  const oldOutputsArray: any[] = Array.isArray(diff.oldValue)
    ? diff.oldValue
    : [];
  const newOutputsArray: any[] = Array.isArray(diff.newValue)
    ? diff.newValue
    : [];

  // Map them by variable name
  const oldOutputsMap = oldOutputsArray.reduce(
    (acc, curr) => ({ ...acc, [curr.name]: curr.mappings }),
    {},
  );
  const newOutputsMap = newOutputsArray.reduce(
    (acc, curr) => ({ ...acc, [curr.name]: curr.mappings }),
    {},
  );

  const allVarNames = Array.from(
    new Set([...Object.keys(oldOutputsMap), ...Object.keys(newOutputsMap)]),
  );

  return (
    <div className={styles.container}>
      <div className={styles.mainLabel}>Merge Mappings</div>

      <div className={styles.variablesList}>
        {allVarNames.map((varName) => {
          const oldMappings: any[] = oldOutputsMap[varName];
          const newMappings: any[] = newOutputsMap[varName];

          return (
            <div key={varName} className={styles.variableBox}>
              <div className={styles.variableHeader}>
                <span className={styles.variableName}>{varName}</span>
                <span className={styles.badge}>VARIABLE</span>
              </div>

              {/* SIDE BY SIDE COMPARISON */}
              <div className={styles.comparisonContainer}>
                {/* PROD (OLD) SIDE */}
                <div className={styles.oldValue}>
                  <div className={styles.miniLabel}>{wasLabel}</div>
                  {oldMappings ? (
                    oldMappings.length > 0 ? (
                      <div className={styles.mappingList}>
                        {oldMappings.map((mapping, idx) => (
                          <div key={`old-${idx}`} className={styles.mappingRow}>
                            <span className={styles.mappingIndex}>
                              Input {idx + 1}
                            </span>
                            <SmartValue
                              value={mapping}
                              handleScrollToModule={handleScrollToModule}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className={styles.noMapping}>
                        No mappings defined
                      </span>
                    )
                  ) : (
                    <span className={styles.noMapping}>undefined</span>
                  )}
                </div>

                <div className={styles.arrow}>➔</div>

                {/* SANDBOX (NEW) SIDE */}
                <div className={styles.newValue}>
                  <div className={styles.miniLabel}>{becomesLabel}</div>
                  {newMappings ? (
                    newMappings.length > 0 ? (
                      <div className={styles.mappingList}>
                        {newMappings.map((mapping, idx) => (
                          <div key={`new-${idx}`} className={styles.mappingRow}>
                            <span className={styles.mappingIndex}>
                              Branch {idx + 1}
                            </span>
                            <SmartValue
                              value={mapping}
                              handleScrollToModule={handleScrollToModule}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className={styles.noMapping}>
                        No mappings defined
                      </span>
                    )
                  ) : (
                    <span className={styles.noMapping}>Variable removed</span>
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

export default MergeMappingDiffRow;
