import type { PropsWithChildren } from "react";
import styles from "./Section.module.scss";

interface SectionProps {
  header: string;
}

const Section: React.FC<PropsWithChildren<SectionProps>> = ({
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

export default Section;
