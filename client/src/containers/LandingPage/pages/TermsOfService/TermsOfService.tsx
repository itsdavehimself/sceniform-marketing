import React from "react";
import styles from "./TermsOfService.module.scss";
import Footer from "../Pricing/components/Footer/Footer";

const TermsOfService: React.FC = () => {
  return (
    <main className={styles.termsContainer}>
      <div className={styles.termsPage}>
        <div className={styles.contentWrapper}>
          <section className={styles.headerSection}>
            <h1>Terms of Service</h1>
            <p>
              <strong>Last Updated:</strong> March 2026
            </p>
          </section>

          <section className={styles.termsSection}>
            <p>
              Welcome to Sceniform. These Terms of Service ("Terms") govern your
              use of the Sceniform web application, deployment proxy, and
              associated services (collectively, the "Service"). By registering
              for an account or using the Service, you agree to be bound by
              these Terms.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>1. Description of Service</h2>
            <p>
              Sceniform provides a visual interface for comparing Make.com
              scenario blueprints (JSON) and a proxy service to facilitate the
              deployment of those blueprints across Make.com organizations and
              teams. We are an independent, third-party tool and are not legally
              affiliated with, endorsed by, or sponsored by Make (Celonis).
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>2. Assumption of Risk and Liability</h2>
            <div className={styles.warningBlock}>
              <h3>Limitation of Liability for Deployments</h3>
              <p>
                Sceniform provides a visual representation of scenario
                differences, but we do not guarantee the functional success,
                logic integrity, or safety of any scenario deployed through our
                platform. You are strictly responsible for testing, validating,
                and auditing any scenario before deploying it to a production
                environment.
              </p>
            </div>
            <p>
              By using our deployment proxy, you expressly agree that Sceniform
              shall not be held liable for any indirect, incidental, special, or
              consequential damages resulting from your use of the Service. This
              includes, but is not limited to:
            </p>
            <ul>
              <li>
                Data loss, corruption, or unwanted mutations within third-party
                applications (e.g., Airtable, Salesforce, Slack) triggered by
                your deployments.
              </li>
              <li>
                API rate limit penalties, account suspensions, or third-party
                platform lockouts.
              </li>
              <li>
                Loss of revenue, business interruption, or loss of client
                contracts resulting from broken production automations.
              </li>
            </ul>
          </section>

          <section className={styles.termsSection}>
            <h2>3. Account Security and API Keys</h2>
            <p>
              You are entirely responsible for maintaining the confidentiality
              of your Sceniform login credentials and the Make.com API keys you
              provide to the Service.
            </p>
            <ul>
              <li>
                <strong>Organization Access:</strong> If you grant other users
                access to your Sceniform Organization, you are responsible for
                their actions and deployments.
              </li>
              <li>
                <strong>Key Revocation:</strong> You agree to immediately revoke
                your Make.com API keys within the Make.com dashboard if you
                suspect your credentials have been compromised.
              </li>
            </ul>
          </section>

          <section className={styles.termsSection}>
            <h2>4. Acceptable Use and Third-Party Terms</h2>
            <p>
              Because Sceniform interacts directly with Make.com via their API,
              your use of Sceniform is also subject to Make's Terms of Service
              and API usage guidelines.
            </p>
            <ul>
              <li>
                You agree not to use Sceniform to circumvent Make.com's billing,
                operational limits, or security protocols.
              </li>
              <li>
                You agree not to reverse-engineer, decompile, or attempt to
                extract the source code of our semantic diffing engine.
              </li>
              <li>
                We reserve the right to suspend or terminate your account
                immediately if your API usage causes excessive strain on our
                proxy servers or violates these terms.
              </li>
            </ul>
          </section>

          <section className={styles.termsSection}>
            <h2>5. Service Availability ("As Is")</h2>
            <p>
              We strive for maximum uptime, but Sceniform is provided on an "AS
              IS" and "AS AVAILABLE" basis. We do not warrant that the Service
              will be uninterrupted, error-free, or completely secure. We
              reserve the right to modify, suspend, or discontinue the Service
              at any time with or without notice.
            </p>
          </section>

          <section className={styles.termsSection}>
            <h2>6. Contact Information</h2>
            <p>
              If you have any questions about these Terms, or if you need to
              report a violation, please contact us at:
            </p>
            <div className={styles.contactBlock}>
              <p>
                <strong>[Your Legal Name / Sceniform LLC]</strong>
              </p>
              <p className={styles.email}>
                <a href="mailto:support@sceniform.com">support@sceniform.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default TermsOfService;
