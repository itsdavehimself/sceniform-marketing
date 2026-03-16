import React, { useState } from "react";
import styles from "./Settings.module.scss";
import Section from "../../components/Section/Section";
import { SignOutButton, useAuth, useClerk, useUser } from "@clerk/clerk-react";
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
import WorkspaceDropdown from "../../components/WorkspaceDropdown/WorkspaceDropdown";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { getToken, orgRole } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();

  const { savedKeys, isLoading, workspaceGroups } = useMakeContext();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const defaultOrgId = user?.unsafeMetadata?.defaultMakeOrgId as
    | number
    | undefined;
  const defaultTeamId = user?.unsafeMetadata?.defaultMakeTeamId as
    | number
    | undefined;

  const isAdmin = orgRole === "org:admin";

  const handleSelectDefaultWorkspace = async (
    orgId: number,
    teamId: number,
  ) => {
    if (!user) return;
    try {
      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          defaultMakeOrgId: orgId,
          defaultMakeTeamId: teamId,
        },
      });
    } catch (err) {
      console.error("Failed to update default workspace", err);
    }
  };

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

      await signOut({ redirectUrl: "https://sceniform.com" });
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
      <div className={styles.settingsScrollable}>
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => !isDeletingAccount && setIsDeleteModalOpen(false)}
          title="Delete Account"
          size="sm"
        >
          <p className={styles.modalText}>
            Are you absolutely sure? This will permanently delete your account.
            If you are the last member of your organization, all API keys and
            vault data will be immediately destroyed.{" "}
            <strong>This action cannot be undone.</strong>
          </p>

          {deleteError && <p className={styles.deleteError}>{deleteError}</p>}

          <div className={styles.modalButtonGroup}>
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

          <Section header="Preferences">
            <SectionMultiItem
              title="Default Workspace"
              description="Select the Make.com organization and team to load automatically when you open the app."
            >
              <div className={styles.dropdownContainer}>
                <WorkspaceDropdown
                  groups={workspaceGroups || []}
                  selectedOrgId={defaultOrgId}
                  selectedTeamId={defaultTeamId}
                  onSelect={handleSelectDefaultWorkspace}
                  availableZones={savedKeys.map((k) => k.zone)}
                  placeholder="Select Default Workspace"
                />
              </div>
            </SectionMultiItem>
          </Section>

          <Section header="Account">
            <SectionItem
              title="Sign Out"
              description="Sign out of your current session."
            >
              <SignOutButton redirectUrl="https://sceniform.com">
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
      </div>
    </main>
  );
};

export default Settings;
