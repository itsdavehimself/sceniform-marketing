import React from "react";
import { Check } from "lucide-react";
import { SignUpButton } from "@clerk/clerk-react";
import ActionButton from "../../../../components/ActionButton/ActionButton";
import PricingSection from "./components/PricingSection/PricingSection";
import styles from "./Pricing.module.scss";
import Footer from "./components/Footer/Footer";

const PricingPage: React.FC = () => {
  return (
    <main className={styles.pricingContainer}>
      <div className={styles.pricingSection}>
        <header className={styles.header}>
          <h1>Simple, transparent pricing.</h1>
          <p>Choose the plan that fits your automation workflow.</p>
        </header>

        <div className={styles.tierGrid}>
          {/* SANDBOX TIER */}
          <PricingSection header="Free">
            <div className={styles.tierContent}>
              <div className={styles.priceBlock}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>0</span>
                <span className={styles.interval}>/mo</span>
              </div>
              <p className={styles.tagline}>
                The perfect sandbox for individual developers.
              </p>

              <ul className={styles.featureList}>
                <li>
                  <Check size={18} /> 20 Diffs / Month per Org
                </li>
                <li>
                  <Check size={18} /> Max 30 Modules Scenarios
                </li>
                <li>
                  <Check size={18} /> Logic-Only Diffs
                </li>
                <li>
                  <Check size={18} /> Mapping Audits
                </li>
                <li>
                  <Check size={18} /> Route Inspection
                </li>
                <li>
                  <Check size={18} /> Single Zone Access
                </li>
              </ul>

              <SignUpButton mode="modal">
                <div className={styles.ctaWrapper}>
                  <ActionButton
                    title="Get Started"
                    variant="secondary"
                    size="lg"
                    fontSize="lg"
                  />
                </div>
              </SignUpButton>
            </div>
          </PricingSection>

          {/* PRO TIER */}
          <PricingSection header="Pro">
            <div className={`${styles.tierContent} ${styles.proTier}`}>
              <div className={styles.badge}>Most Popular</div>
              <div className={styles.priceBlock}>
                <span className={styles.currency}>$</span>
                <span className={styles.amount}>49</span>
                <span className={styles.interval}>/mo</span>
              </div>
              <p className={styles.tagline}>
                Push changes safely across environments with absolute
                confidence.
              </p>

              <ul className={styles.featureList}>
                <li>
                  <Check size={18} /> Unlimited Everything
                </li>
                <li>
                  <Check size={18} /> Intelligent Pushing
                </li>
                <li>
                  <Check size={18} /> Smart Connection Swaps
                </li>
                <li>
                  <Check size={18} /> Deployment Safeguards
                </li>
                <li>
                  <Check size={18} /> Convention Enforcement
                </li>
                <li>
                  <Check size={18} /> Test Data Detection
                </li>
                <li>
                  <Check size={18} /> Granular Audit Logs
                </li>
                <li>
                  <Check size={18} /> Multi-Zone Support
                </li>
              </ul>

              <SignUpButton mode="modal">
                <div className={styles.ctaWrapper}>
                  <ActionButton
                    title="Upgrade to Pro"
                    variant="primary"
                    size="lg"
                    fontSize="lg"
                  />
                </div>
              </SignUpButton>
            </div>
          </PricingSection>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default PricingPage;
