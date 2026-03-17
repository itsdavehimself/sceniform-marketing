import React, { useMemo } from "react";
import Footer from "../../components/Footer/Footer";
import styles from "./Changelog.module.scss";
import ChangelogSidebar from "./components/ChangelogSidebar/ChangelogSidebar";
import ChangeBadge, {
  type ChangeType,
} from "./components/ChangeBadge/ChangeBadge";

import rawChangelogData from "../../../../content/changelog.json";

export type Category = "Engine" | "UI/UX" | "Deployment" | "AI" | "General";

export interface ChangeItem {
  id: string;
  type: ChangeType;
  category: Category;
  message: string;
}

export interface Release {
  version: string;
  date: string;
  title: string;
  description?: string;
  changes: ChangeItem[];
}

const changelogData = rawChangelogData as Release[];

const Changelog: React.FC = () => {
  const groupedReleases = useMemo(() => {
    const groups: Record<string, Release[]> = {};
    changelogData.forEach((release) => {
      const date = new Date(
        release.date.includes("T") ? release.date : `${release.date}T00:00:00`,
      );

      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });

      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(release);
    });
    return groups;
  }, []);

  const months = Object.keys(groupedReleases);

  return (
    <main className={styles.changelogContainer}>
      {/* New wrapper correctly centers content and allows footer to drop */}
      <div className={styles.changelogPage}>
        <div className={styles.contentWrapper}>
          <section className={styles.headerSection}>
            <h1>Changelog</h1>
            <p>
              New updates, features, and improvements to the Sceniform engine.
            </p>
          </section>

          <div className={styles.mainGrid}>
            <ChangelogSidebar months={months} />

            <div className={styles.feed}>
              {Object.entries(groupedReleases).map(([monthYear, releases]) => (
                <div
                  key={monthYear}
                  id={monthYear.toLowerCase().replace(/\s+/g, "-")}
                  className={styles.monthGroup}
                >
                  <h3 className={styles.monthHeader}>{monthYear}</h3>

                  {releases.map((release) => (
                    <article key={release.version} className={styles.release}>
                      <div className={styles.releaseHeader}>
                        <div className={styles.versionData}>
                          <span className={styles.version}>
                            v{release.version}
                          </span>
                          <span className={styles.date}>
                            {new Date(
                              release.date.includes("T")
                                ? release.date
                                : `${release.date}T00:00:00`,
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <h2>{release.title}</h2>
                        {release.description && <p>{release.description}</p>}
                      </div>

                      <div className={styles.changeList}>
                        {release.changes.map((change) => (
                          <div key={change.id} className={styles.changeItem}>
                            <div className={styles.badgeColumn}>
                              <ChangeBadge type={change.type} />
                            </div>

                            <p className={styles.changeMessage}>
                              <strong>{change.category}:</strong>{" "}
                              {change.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default Changelog;
