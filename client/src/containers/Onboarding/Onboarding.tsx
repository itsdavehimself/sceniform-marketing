import { useState } from "react";
import MakeConnect from "../../components/MakeConnect/MakeConnect";
import { PricingTable } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import styles from "./Onboarding.module.scss";

const Onboarding: React.FC = () => {
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const defaultStep =
    searchParams.get("step") === "connect" ? "connect" : "pricing";

  const [step, setStep] = useState<"pricing" | "connect">(defaultStep);

  return (
    <main className={styles.onboarding}>
      {step === "pricing" ? (
        <div className={styles.pricingWrapper}>
          <div className={styles.onboardingHeader}>
            <h1>Select a Sceniform Plan</h1>
            <p>
              Choose a plan to activate your workspace and start diffing
              scenarios.
            </p>
          </div>

          <PricingTable
            for="organization"
            newSubscriptionRedirectUrl="/onboarding?step=connect"
          />

          <div className={styles.continueAction}>
            <button
              className={styles.continueButton}
              onClick={() => setStep("connect")}
            >
              Connect to Make.com
            </button>
          </div>
        </div>
      ) : (
        <MakeConnect />
      )}
    </main>
  );
};

export default Onboarding;
