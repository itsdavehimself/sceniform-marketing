import type { PropsWithChildren } from "react";
import styles from "./PricingSection.module.scss";

interface PricingSectionProps {
  header: string;
}

const PricingSection: React.FC<PropsWithChildren<PricingSectionProps>> = ({
  header,
  children,
}) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{header}</h2>
      <div className={styles.sectionContainer}>{children}</div>
    </section>
  );
};

export default PricingSection;
