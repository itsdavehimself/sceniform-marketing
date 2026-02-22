import styles from "./SectionHeader.module.scss";
import SectionHeaderButton from "./SectionHeaderButton/SectionHeaderButton";

interface SectionHeaderProps<T extends string> {
  title: string;
  currentView: string;
  setCurrentView: (view: T) => void;
  buttons: { title: string; view: T }[];
}

const SectionHeader = <T extends string>({
  title,
  buttons,
  currentView,
  setCurrentView,
}: SectionHeaderProps<T>) => {
  return (
    <section className={styles.sectionHeader}>
      <h2>{title}</h2>
      <div className={styles.sectionNav}>
        {buttons.map((btn) => (
          <SectionHeaderButton
            key={btn.view}
            title={btn.title}
            onClick={() => setCurrentView(btn.view)}
            isActive={currentView === btn.view}
          />
        ))}
      </div>
    </section>
  );
};

export default SectionHeader;
