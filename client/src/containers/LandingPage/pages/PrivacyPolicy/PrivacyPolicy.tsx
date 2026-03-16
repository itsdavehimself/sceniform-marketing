import Footer from "../Pricing/components/Footer/Footer";
import styles from "./PrivacyPolicy.module.scss";

const PrivacyPolicy: React.FC = () => {
  return (
    <main className={styles.privacyContainer}>
      <div className={styles.privacyPage}>
        <div className={styles.contentWrapper}>
          <section className={styles.headerSection}>
            <h1>Privacy Policy</h1>
            <p>
              <strong>Last Updated:</strong> March 2026
            </p>
          </section>

          <section className={styles.policySection}>
            <p>
              Welcome to Sceniform. We build tools for automation agencies to
              visually compare, manage, and deploy Make.com scenario changes.
              Because our platform interacts with your proprietary logic and
              third-party API keys, privacy and data security are built into the
              core architecture of our system.
            </p>
            <p>
              This Privacy Policy explains how we collect, process, and protect
              your data when you use Sceniform.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2>1. The Data We Collect</h2>
            <p>
              We only collect the absolute minimum data required to authenticate
              you, bill you, and make the diffing engine work.
            </p>
            <ul>
              <li>
                <strong>Personal Account Data:</strong> When you sign up via
                email/password or Google SSO, we collect your email address, an
                authentication ID, and optionally your first and last name.
              </li>
              <li>
                <strong>Make.com Connection Data:</strong> When you add a
                Make.com API key, we collect the key itself, alongside metadata
                such as your Make.com Organization ID, Team ID, and Zone (e.g.,{" "}
                <code>us1</code>).
              </li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2>2. How We Process Your Data (Zero Blueprint Retention)</h2>
            <p>
              Our core diffing engine operates with a{" "}
              <strong>Zero Data Retention</strong> policy for your actual
              scenario workflows.
            </p>
            <ul>
              <li>
                <strong>In-Memory Processing:</strong> When you compare a
                Production blueprint against a Sandbox blueprint, Sceniform
                fetches the JSON directly from Make.com via API and processes
                the logic (modules, mappings, filters) entirely in memory.
              </li>
              <li>
                <strong>No Database Storage:</strong> We <strong>do not</strong>{" "}
                store, log, or persist your Make.com blueprint JSONs in our
                database.
              </li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2>3. Data Storage and Security</h2>
            <p>
              We treat your API keys like highly sensitive infrastructure
              credentials.
            </p>
            <ul>
              <li>
                <strong>Encryption at Rest:</strong> All Make.com API keys are
                immediately encrypted at rest within our backend using
                enterprise-grade Microsoft .NET Data Protection standards before
                being saved to our database.
              </li>
              <li>
                <strong>Transmission:</strong> All data transmitted between your
                browser, our servers, and Make.com is encrypted in transit using
                standard TLS/SSL protocols.
              </li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2>4. Organization Data vs. Personal Data</h2>
            <p>
              Sceniform is designed for multi-user agency teams. To prevent
              accidental infrastructure breakage, we strictly separate Personal
              Data from Organization Data.
            </p>
            <ul>
              <li>
                <strong>Organization Ownership:</strong> Make.com API keys and
                connections added to Sceniform belong to the{" "}
                <strong>Organization</strong>, not the individual user who added
                them.
              </li>
              <li>
                <strong>Team Changes:</strong> If a user leaves your agency and
                deletes their personal Sceniform account, their account data is
                purged, but the encrypted Make.com API keys they added will
                automatically transfer to the next available Organization
                Administrator to ensure your workflows remain uninterrupted.
              </li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2>5. Third-Party Sub-processors</h2>
            <p>
              To run Sceniform securely and reliably, we use the following
              vetted infrastructure providers:
            </p>
            <ul>
              <li>
                <strong>Render:</strong> Cloud hosting and backend
                infrastructure.
              </li>
              <li>
                <strong>Neon.tech:</strong> Serverless PostgreSQL database
                hosting.
              </li>
              <li>
                <strong>Clerk:</strong> Secure user authentication, identity
                management, and billing.
              </li>
            </ul>
            <p>
              <em>
                (Note: We do not currently use AI models to process your data.
                If we introduce AI-powered features in the future, we will
                update this policy and ensure strict zero-data-retention
                agreements are in place so your blueprints are never used to
                train public models).
              </em>
            </p>
          </section>

          <section className={styles.policySection}>
            <h2>6. Data Deletion and Your Rights</h2>
            <p>You have complete control over your data.</p>
            <ul>
              <li>
                <strong>Account Deletion:</strong> You can delete your personal
                account at any time. Upon request, your Personal Data (Name,
                Email, Auth IDs) is immediately and permanently purged from our
                database and authentication provider.
              </li>
              <li>
                <strong>Organization Deletion:</strong> If you are the sole
                member of an Organization and you delete your account (or if the
                last remaining user in an Organization deletes theirs), the
                entire Organization—including all encrypted Make.com API keys
                and metadata—is permanently destroyed.
              </li>
              <li>
                <strong>Manual Key Removal:</strong> You can manually delete any
                Make.com connection from your Sceniform dashboard at any time,
                which permanently removes the encrypted key from our database.
              </li>
            </ul>
          </section>

          <section className={styles.policySection}>
            <h2>7. Changes to This Policy</h2>
            <p>
              As we build new features (such as audit logs or deployment
              fleets), our data practices may evolve. We will notify you of any
              significant changes to this policy via the email address
              associated with your account.
            </p>
          </section>

          <section className={styles.policySection}>
            <h2>8. Contact Us</h2>
            <p>
              If you have questions about our data architecture, privacy
              practices, or wish to submit a data deletion request, please
              contact us at:
            </p>
            <div className={styles.contactBlock}>
              <p>
                <strong>Sceniform Team</strong>
              </p>
              <p className={styles.email}>
                <a href="mailto:privacy@sceniform.com">privacy@sceniform.com</a>
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
};

export default PrivacyPolicy;
