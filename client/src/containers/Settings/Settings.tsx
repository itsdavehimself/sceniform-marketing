import React, { useState } from "react";
import styles from "./Settings.module.scss";
import Section from "../../components/Section/Section";
import { SignOutButton, useAuth, useClerk } from "@clerk/clerk-react";
import ActionButton from "../../components/ActionButton/ActionButton";
import SectionItem from "../../components/Section/SectionItem/SectionItem";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { formatDate } from "date-fns";
import { useNavigate } from "react-router-dom";
import SectionMultiItem from "../../components/Section/SectionMultiItem/SectionMultiItem";
import SectionButton from "../../components/Section/SectionButton/SectionButton";
import { Plus } from "lucide-react";
import Modal from "../../components/Modal/Modal";
import { useMakeContext } from "../../context/MakeContext";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { getToken, orgRole } = useAuth();
  const { signOut } = useClerk();

  const { savedKeys, isLoading } = useMakeContext();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const isAdmin = orgRole === "org:admin";

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/Account`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to delete account.");
      }

      await signOut();
    } catch (err: any) {
      setDeleteError(err.message);
      setIsDeletingAccount(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loaderWrapper}>
        <LoadingSpinner dimensions={{ x: 8, y: 8 }} />
      </div>
    );
  }

  return (
    <main className={styles.settingsContainer}>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
        title="Delete Account"
        size="sm"
      >
        <p
          style={{
            fontSize: "0.875rem",
            color: "#4b5563",
            marginBottom: "1.5rem",
            lineHeight: 1.5,
          }}
        >
          Are you absolutely sure? This will permanently delete your account. If
          you are the last member of your organization, all API keys and vault
          data will be immediately destroyed.{" "}
          <strong>This action cannot be undone.</strong>
        </p>

        {deleteError && (
          <p
            style={{
              color: "#dc2626",
              fontSize: "0.875rem",
              marginBottom: "1rem",
            }}
          >
            {deleteError}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem",
          }}
        >
          <ActionButton
            title="Cancel"
            variant="secondary"
            disabled={isDeletingAccount}
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <ActionButton
            title={isDeletingAccount ? "Deleting..." : "Delete Permanently"}
            variant="danger"
            disabled={isDeletingAccount}
            onClick={handleDeleteAccount}
          />
        </div>
      </Modal>

      <h1>Settings</h1>
      <section className={styles.settingsSections}>
        <Section header="Connections">
          <SectionMultiItem
            title="API Keys"
            description="Your Make.com API keys. You can have up to one per zone/region (e.g., us1, eu2, etc.)."
          >
            {savedKeys.map((k) => (
              <div key={k.uid} className={styles.apiKeyItem}>
                <div className={styles.apiKeyInfo}>
                  <div className={styles.apiKeyLabel}>
                    {k.label} <span className={styles.zone}>({k.zone})</span>
                  </div>
                  <div className={styles.apiKeyDescription}>
                    <span className={styles.created}>
                      Created {formatDate(k.createdAt, "MMM dd, yyyy h:mm a")}
                    </span>
                  </div>
                </div>
                {isAdmin && (
                  <ActionButton
                    variant="secondary"
                    title="Edit"
                    onClick={() => navigate(`/settings/api-key/${k.uid}`)}
                  />
                )}
              </div>
            ))}
          </SectionMultiItem>
          {isAdmin && (
            <SectionButton
              title="Add API Key"
              icon={Plus}
              onClick={() => navigate("/settings/api-key/add")}
            />
          )}
        </Section>

        <Section header="Account">
          <SectionItem
            title="Sign Out"
            description="Sign out of your current session."
          >
            <SignOutButton>
              <ActionButton title="Sign Out" variant="primary" />
            </SignOutButton>
          </SectionItem>
        </Section>

        <Section header="Danger Zone">
          <SectionItem
            title="Delete Account"
            description="Delete your account and all of its associated data."
          >
            <ActionButton
              title="Delete Account"
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
            />
          </SectionItem>
        </Section>
      </section>
    </main>
  );
};

export default Settings;
