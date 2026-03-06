import {
  ArrowLeftRight,
  Ban,
  CheckCircle,
  EyeOff,
  FileText,
  Filter,
  Layers,
  Lock,
  Network,
  Radar,
  Terminal,
  Waypoints,
  Download,
  GitCompare,
  ShieldCheck,
} from "lucide-react";
import ActionButton from "../../components/ActionButton/ActionButton";
import FeatureGridItem from "./components/FeatureGridItem";
import styles from "./LandingPage.module.scss";
import { SignUpButton } from "@clerk/clerk-react";

const LandingPage: React.FC = () => {
  return (
    <main className={styles.landingPage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>Deploy the logic. Keep the connections.</h1>
          <div className={styles.subHeader}>
            <h3>
              Stop choosing between a tedious manual rebuild and a destructive
              JSON import. Visually resolve hotfix drift, catch forgotten
              filters, and safely merge sandbox scenario updates without
              dropping your live connections.
            </h3>
          </div>
          <SignUpButton>
            <ActionButton title="Compare Scenarios" size="lg" fontSize="lg" />
          </SignUpButton>
        </div>
      </section>

      {/* 2. VIDEO DEMO */}
      <section className={styles.videoSection}>
        <div className={styles.video}></div>
      </section>

      {/* 3. TRUST BANNER (SOCIAL PROOF) */}
      <section className={styles.trustBanner}>
        <p>
          Built for Make.com agency owners and enterprise automation architects
        </p>
      </section>

      {/* 4. FEATURE GRID */}
      <section className={styles.featureGridSection}>
        <h2 className={styles.gridHeader}>
          Your Make.com scenarios, perfectly synced.
        </h2>
        <div className={styles.featureGrid}>
          <FeatureGridItem
            title="Lock production connections"
            text="Never re-authenticate a Slack or Airtable module again. Our engine automatically hunts down and preserves your live connections during a deployment, preventing destructive JSON overwrites."
            icon={Lock}
          />
          <FeatureGridItem
            title="Semantic graph diffing"
            text="Standard JSON diffs are a nightmare to read. We analyze your scenario as a connected flow of logic, highlighting exactly which modules, filters, and data mappings changed without the code-level headache."
            icon={Network}
          />
          <FeatureGridItem
            title="Resolve hotfix drift instantly"
            text="Did a client add a rogue filter directly in production? Spot undocumented changes immediately before you accidentally overwrite them with an outdated sandbox JSON."
            icon={Radar}
          />
          <FeatureGridItem
            title="Surface forgotten filters"
            text="It's easy to overlook a hardcoded value or a small routing filter buried deep between modules. Our engine highlights these logic gates instantly so nothing slips through to production."
            icon={Filter}
          />
          <FeatureGridItem
            title="Push, pull, and rollback"
            text="Seamlessly push sandbox updates up to production, or pull the latest production state down to your sandbox so you are always developing on the most current version."
            icon={ArrowLeftRight}
          />
          <FeatureGridItem
            title="End the manual rebuild tax"
            text="Stop documenting every tiny logic tweak in a sandbox just so you can rebuild it by hand in production. Merge the JSON safely, keep the connections intact, and get your time back."
            icon={Ban}
          />
        </div>
      </section>

      {/* 5. ARCHITECTURE / UNDER THE HOOD */}
      <section className={styles.architectureSection}>
        <h2 className={styles.sectionHeader}>
          How it works: The Safe-Deploy Proxy
        </h2>
        <div className={styles.stepGrid}>
          <div className={styles.stepCard}>
            <Download size={32} className={styles.stepIcon} />
            <h4>1. Fetch</h4>
            <p>
              We pull your Sandbox and Production blueprints directly via the
              Make API. No raw API keys are stored permanently on our servers.
            </p>
          </div>
          <div className={styles.stepCard}>
            <GitCompare size={32} className={styles.stepIcon} />
            <h4>2. Compare</h4>
            <p>
              Our React engine computes the semantic DAG diff entirely in your
              browser, filtering out visual coordinate noise instantly.
            </p>
          </div>
          <div className={styles.stepCard}>
            <ShieldCheck size={32} className={styles.stepIcon} />
            <h4>3. Proxy</h4>
            <p>
              When you click deploy, our backend safely proxies the payload to
              Make, mathematically guaranteeing your live webhooks are locked.
            </p>
          </div>
        </div>
      </section>

      {/* 6. THE ROADMAP */}
      <section className={styles.roadmapSection}>
        <h2 className={styles.sectionHeader}>The Enterprise Roadmap</h2>
        <p className={styles.sectionSubtext}>
          We're building the ultimate governance platform for Make.com fleets.
        </p>

        <div className={styles.roadmapList}>
          <div className={styles.roadmapItem}>
            <span className={styles.badge}>Next</span>
            <div className={styles.roadmapContent}>
              <h4>The Auditor (SOC2 Compliance)</h4>
              <p>
                Generate compliant PDF/Sheet paper trails detailing exactly who
                changed what logic, and when.
              </p>
            </div>
          </div>
          <div className={styles.roadmapItem}>
            <span className={styles.badge}>Later</span>
            <div className={styles.roadmapContent}>
              <h4>Variable Impact Analyzer</h4>
              <p>
                A visual trace showing downstream dependencies. E.g., "Deleting
                this Airtable column will break mapping in Module 20."
              </p>
            </div>
          </div>
          <div className={styles.roadmapItem}>
            <span className={styles.badge}>Future</span>
            <div className={styles.roadmapContent}>
              <h4>The Blueprint Linter</h4>
              <p>
                Static analysis that automatically flags missing error handlers,
                infinite loops, and unmapped variables before deployment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className={styles.bottomCtaSection}>
        <h2>Ready to stop breaking Production?</h2>
        <SignUpButton>
          <ActionButton title="Compare Scenarios" size="lg" fontSize="lg" />
        </SignUpButton>
      </section>
    </main>
  );
};

export default LandingPage;
