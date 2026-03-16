import {
  ArrowLeftRight,
  Ban,
  Filter,
  Lock,
  Network,
  Radar,
  GitCompare,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import ActionButton from "../../components/ActionButton/ActionButton";
import FeatureGridItem from "./components/FeatureGridItem/FeatureGridItem";
import styles from "./LandingPage.module.scss";
import { SignUpButton } from "@clerk/clerk-react";
import Carousel from "./components/Carousel/Carousel";
import Footer from "./pages/Pricing/components/Footer/Footer";

const LandingPage: React.FC = () => {
  return (
    <main className={styles.landingPage}>
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>Deploy the logic. Keep the connections.</h1>
          <div className={styles.subHeader}>
            <h3>
              Stop choosing between tedious manual rebuilds and destructive JSON
              imports. Visually resolve hotfix drift and merge sandbox updates
              safely—without ever dropping your live connections.
            </h3>
          </div>
          <div className={styles.cta}>
            <SignUpButton forceRedirectUrl="https://app.sceniform.com/onboarding">
              <ActionButton title="Compare Scenarios" size="lg" fontSize="lg" />
            </SignUpButton>
            <p className={styles.ctaTagline}>Try the differ for free.</p>
          </div>
        </div>
      </section>

      {/* 2. VIDEO DEMO */}
      {/* <section className={styles.videoSection}>
        <div className={styles.video}></div>
      </section> */}

      {/* 3. TRUST BANNER (SOCIAL PROOF) */}
      <section className={styles.trustBanner}>
        <p>
          Built for Make.com agency owners and enterprise automation architects
        </p>
      </section>

      {/* 4. FEATURE GRID */}
      <section id="features" className={styles.featureGridSection}>
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
            title="Visual logic diffing"
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

      <Carousel />

      {/* 5. ARCHITECTURE / UNDER THE HOOD */}
      <section className={styles.architectureSection}>
        <h2 className={styles.sectionHeader}>
          How it works: The Safe-Deploy Proxy
        </h2>
        <div className={styles.stepGrid}>
          {/* Updated Step 1 */}
          <div className={styles.stepCard}>
            <KeyRound size={24} className={styles.stepIcon} />
            <h4>1. Secure Connect</h4>
            <p>
              Your Make API credentials are secured at rest using ASP.NET Core
              Data Protection (AES-GCM). We fetch your blueprints securely via
              proxy, meaning your raw keys are never exposed to the browser or
              our server logs.
            </p>
          </div>

          {/* Existing Step 2 */}
          <div className={styles.stepCard}>
            <GitCompare size={24} className={styles.stepIcon} />
            <h4>2. Compare</h4>
            <p>
              Our React engine computes the semantic diff entirely in your
              browser, filtering out noise instantly.
            </p>
          </div>

          {/* Existing Step 3 */}
          <div className={styles.stepCard}>
            <ShieldCheck size={24} className={styles.stepIcon} />
            <h4>3. Proxy</h4>
            <p>
              When you click deploy, our backend safely proxies the payload to
              Make, guaranteeing your live webhooks and connections are locked.
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
          {/* NEAR TERM */}
          <div className={styles.roadmapItem}>
            <span className={styles.badge}>Next</span>
            <div className={styles.roadmapContent}>
              <h4>AI Summaries & Versioning</h4>
              <p>
                Translate complex JSON diffs into plain-English commit messages,
                auto-generate scenario documentation, and track version changes
                to your LLM prompts over time.
              </p>
            </div>
          </div>

          {/* MID TERM */}
          <div className={styles.roadmapItem}>
            <span className={styles.badge}>Later</span>
            <div className={styles.roadmapContent}>
              <h4>The Agency Linter & Auditor</h4>
              <p>
                Enforce strict module naming conventions across your team (e.g.,
                requiring 'GET [resource]') to standardize client handoffs,
                streamline new developer onboarding, and generate paper trails
                of every scenario change.
              </p>
            </div>
          </div>

          {/* FAR TERM */}
          <div className={styles.roadmapItem}>
            <span className={styles.badge}>Future</span>
            <div className={styles.roadmapContent}>
              <h4>Fleet Manager & Active Recovery</h4>
              <p>
                Deploy master scenario template updates across dozens of client
                organizations instantly. Get proactive alerts when upstream
                dependencies or live connections stall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA */}
      <section className={styles.bottomCtaSection}>
        <h2>Ready to stop breaking production?</h2>
        <SignUpButton forceRedirectUrl="https://app.sceniform.com/onboarding">
          <ActionButton title="Compare Scenarios" size="lg" fontSize="lg" />
        </SignUpButton>
      </section>

      {/* 8. FOOTER */}
      <Footer />
    </main>
  );
};

export default LandingPage;
