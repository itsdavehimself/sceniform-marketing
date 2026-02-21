import React from "react";
import styles from "./FilterConditions.module.scss";
import SmartValue from "../../SmartValue/SmartValue";

interface FilterConditionsProps {
  conditions: any[];
  isDarkMode: boolean;
  handleScrollToModule: (id: string | number) => void;
}

const formatOperator = (op: string) =>
  !op ? "exists" : op.replace(":", " ").toUpperCase();

const FilterConditions: React.FC<FilterConditionsProps> = ({
  conditions,
  handleScrollToModule,
}) => {
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) {
    return <em className={styles.noConditions}>No conditions defined</em>;
  }

  return (
    <div className={styles.container}>
      {conditions.map((orGroup, i) => (
        <div key={i} className={styles.orGroupContainer}>
          {i > 0 && <div className={styles.orDivider}>— OR —</div>}

          <div className={styles.conditionsWrapper}>
            {Array.isArray(orGroup) &&
              orGroup.map((cond: any, j: number) => (
                <div key={j} className={styles.conditionRow}>
                  {j > 0 && <span className={styles.andDivider}>AND</span>}

                  <span className={styles.operandA}>
                    <SmartValue
                      value={cond.a}
                      handleScrollToModule={handleScrollToModule}
                    />
                  </span>

                  <span className={styles.operator}>
                    {formatOperator(cond.o)}
                  </span>

                  <span className={styles.operandB}>
                    <SmartValue
                      value={cond.b}
                      handleScrollToModule={handleScrollToModule}
                    />
                  </span>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilterConditions;
