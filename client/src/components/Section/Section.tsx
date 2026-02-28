import type { PropsWithChildren } from "react";
import styles from "./Section.module.scss";
import SectionItem from "./SectionItem/SectionItem";
import { SignOutButton } from "@clerk/clerk-react";
import ActionButton from "../ActionButton/ActionButton";

interface SectionProps {
  header: string;
}

const Section: React.FC<PropsWithChildren<SectionProps>> = ({ header }) => {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionHeader}>{header}</h2>
      <div className={styles.sectionContainer}>
        <SectionItem
          title="Sign Out"
          description="Sign out of your account."
          children={
            <SignOutButton>
              <ActionButton title="Sign Out" variant="primary" />
            </SignOutButton>
          }
        />
      </div>
    </section>
  );
};

export default Section;
