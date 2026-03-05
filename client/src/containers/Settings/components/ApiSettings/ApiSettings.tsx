import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";

import styles from "./ApiSettings.module.scss";
import Section from "../../../../components/Section/Section";
import SectionItem from "../../../../components/Section/SectionItem/SectionItem";
import ActionButton from "../../../../components/ActionButton/ActionButton";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import Modal from "../../../../components/Modal/Modal";
import { useSavedApiKeys } from "../../../../hooks/useSavedApiKeys";
import BackButton from "../BackButton/BackButton";

const ApiSettings: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const { savedKeys, isLoading: isFetchingKeys } = useSavedApiKeys();

  const [label, setLabel] = useState("");
  const [zone, setZone] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  useEffect(() => {
    if (!isFetchingKeys && savedKeys.length > 0) {
      const currentKey = savedKeys.find((k) => k.uid === uid);
      if (currentKey) {
        setLabel(currentKey.label);
        setZone(currentKey.zone);
      } else {
        navigate("/settings");
      }
    }
  }, [isFetchingKeys, savedKeys, uid, navigate]);

  const handleUpdate = async () => {
    setIsSaving(true);
    setStatus(null);

    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/${uid}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ label }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update connection.");
      }

      setStatus({
        type: "success",
        msg: "Connection label updated successfully.",
      });
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const executeDelete = async () => {
    setIsDeleteModalOpen(false);
    setIsDeleting(true);
    setStatus(null);

    try {
      const token = await getToken();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/${uid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete connection.");
      }

      navigate("/settings");
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message });
      setIsDeleting(false);
    }
  };

  if (isFetchingKeys) {
    return (
      <main
        className={styles.settingsContainer}
        style={{ alignItems: "center", justifyContent: "center" }}
      >
        <LoadingSpinner dimensions={{ x: 8, y: 8 }} />
      </main>
    );
  }

  return (
    <main className={styles.settingsContainer}>
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="sm"
      >
        <p className={styles.modalText}>
          Are you sure you want to delete this connection? Scenarios blueprints
          tied to this zone will no longer load until a new key is added. This
          action cannot be undone.
        </p>
        <div className={styles.modalActions}>
          <ActionButton
            title="Cancel"
            variant="secondary"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <ActionButton
            title="Delete Key"
            variant="danger"
            onClick={executeDelete}
          />
        </div>
      </Modal>

      <div>
        <h1>Edit Connection</h1>

        {status && (
          <div
            className={`${styles.status} ${status.type === "success" ? styles.success : styles.error}`}
          >
            {status.msg}
          </div>
        )}

        <section className={styles.settingsSections}>
          <BackButton />
          <Section header="Connection Details">
            <div className={styles.formContent}>
              <div className={styles.inputGroup}>
                <label>Connection Label</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g., Acme Agency US"
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Target Zone</label>
                <input type="text" value={zone} disabled />
              </div>

              <div className={styles.formFooter}>
                <ActionButton
                  title={isSaving ? "Saving..." : "Save"}
                  variant="primary"
                  onClick={handleUpdate}
                  disabled={isSaving || !label.trim()}
                />
              </div>
            </div>
          </Section>

          <Section header="Danger Zone">
            <SectionItem
              title="Delete Connection"
              description="Permanently remove this Make.com API key from your vault. This action cannot be undone."
            >
              <ActionButton
                title={isDeleting ? "Deleting..." : "Delete Key"}
                variant="danger"
                onClick={() => setIsDeleteModalOpen(true)}
                disabled={isDeleting}
              />
            </SectionItem>
          </Section>
        </section>
      </div>
    </main>
  );
};

export default ApiSettings;
