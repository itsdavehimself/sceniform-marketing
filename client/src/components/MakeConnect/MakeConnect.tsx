import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import styles from "./MakeConnect.module.scss";
import ActionButton from "../ActionButton/ActionButton";
import AppIcon from "../AppIcon/AppIcon";
import Dropdown from "../Dropdown/Dropdown";

export default function MakeConnect() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [zone, setZone] = useState("us1");

  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const zoneOptions = [
    { label: "US1 (us1.make.com)", value: "us1" },
    { label: "US2 (us2.make.com)", value: "us2" },
    { label: "EU1 (eu1.make.com)", value: "eu1" },
    { label: "EU2 (eu2.make.com)", value: "eu2" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "loading", message: "Verifying with Make.com..." });

    try {
      const token = await getToken();

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            apiKey: apiKey,
            label: label || `${zone.toUpperCase()} Connection`,
            zone: zone,
          }),
        },
      );

      if (response.ok) {
        setStatus({
          type: "success",
          message: "Success! Key verified. Redirecting to workspace...",
        });
        setApiKey("");
        setLabel("");

        setTimeout(() => {
          navigate("/scenarios");
        }, 1500);
      } else {
        const errorText = await response.text();
        setStatus({ type: "error", message: errorText });
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        message: "Network error. Make sure the backend is running.",
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <AppIcon accountName="Make" />
          Connect Make.com
        </h2>
        <p className={styles.description}>
          Paste your Personal Access Token below. We will encrypt it and
          securely link it to your organization's vault.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Home Zone</label>
          <Dropdown
            options={zoneOptions}
            value={zone}
            onChange={(val) => setZone(val as string)}
            size="lg"
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="labelInput">
            Connection Label
          </label>
          <input
            id="labelInput"
            type="text"
            className={styles.input}
            placeholder="e.g., Acme Agency Master Key"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="apiKeyInput">
            Make.com API Key
          </label>
          <input
            id="apiKeyInput"
            type="password"
            className={styles.input}
            placeholder="8f72a9b3-..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            required
          />
        </div>
        <ActionButton
          title={status.type === "loading" ? "Verifying..." : "Connect"}
          variant="primary"
          disabled={status.type === "loading" || !apiKey}
          type="submit"
          size="lg"
        />
      </form>

      {status.type !== "idle" && status.type !== "loading" && (
        <div
          className={`${styles.status} ${status.type === "success" ? styles.success : styles.error}`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
