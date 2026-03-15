import { useState, useContext, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Info, CheckCircle2 } from "lucide-react";
import styles from "./MakeConnect.module.scss";
import ActionButton from "../ActionButton/ActionButton";
import Dropdown from "../Dropdown/Dropdown";
import AppIcon from "../AppIcon/AppIcon";
import BackButton from "../../containers/Settings/components/BackButton/BackButton";
import { MakeContext } from "../../context/MakeContext";

export default function MakeConnect() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const makeContext = useContext(MakeContext);
  const isOnboarding = location.pathname.includes("onboarding");

  const [step, setStep] = useState<number>(1);
  const [apiKey, setApiKey] = useState("");
  const [label, setLabel] = useState("");
  const [zone, setZone] = useState("");

  // 🔥 NEW: Local state to track connected zones independently of Context
  const [localConnectedZones, setLocalConnectedZones] = useState<string[]>([]);

  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });

  const allZones = [
    { label: "US1 (us1.make.com)", value: "us1" },
    { label: "US2 (us2.make.com)", value: "us2" },
    { label: "EU1 (eu1.make.com)", value: "eu1" },
    { label: "EU2 (eu2.make.com)", value: "eu2" },
  ];

  // 🔥 NEW: Fetch existing connections on mount (handles page refreshes during onboarding)
  useEffect(() => {
    const fetchExistingZones = async () => {
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const zones = data.connections.map((c: any) => c.zone);
          setLocalConnectedZones(zones);
        }
      } catch (err) {
        console.error("Failed to fetch existing zones", err);
      }
    };

    fetchExistingZones();
  }, [getToken]);

  // Combine Context zones (if available) with our local state
  const contextZones = makeContext?.availableZones || [];
  const combinedZones = Array.from(
    new Set([...contextZones, ...localConnectedZones]),
  );

  const zoneOptions = allZones.filter((z) => !combinedZones.includes(z.value));

  // Auto-select the first available zone
  useEffect(() => {
    if (zoneOptions.length > 0 && !zoneOptions.find((z) => z.value === zone)) {
      setZone(zoneOptions[0].value);
    }
  }, [combinedZones, zoneOptions, zone]);

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
          message: "Success! Key verified and securely saved.",
        });

        // 🔥 NEW: Add the newly verified zone to our local state instantly
        setLocalConnectedZones((prev) => [...prev, zone]);

        if (makeContext?.refreshContext) {
          makeContext.refreshContext();
        }

        setTimeout(() => {
          if (isOnboarding) {
            if (step < 4 && zoneOptions.length > 1) {
              setStep((prev) => prev + 1);
              setApiKey("");
              setLabel("");
              setStatus({ type: "idle", message: "" });
            } else {
              navigate("/scenarios");
            }
          } else {
            navigate("/settings");
          }
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

  const handleSkip = () => {
    navigate("/scenarios");
  };

  if (zoneOptions.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>All Zones Connected</h2>
          <p className={styles.description}>
            You have successfully connected API keys for all available Make.com
            regions.
          </p>
          <div style={{ marginTop: "1.5rem" }}>
            <ActionButton
              title="Go to Scenarios"
              variant="primary"
              onClick={() => navigate("/scenarios")}
              size="lg"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!isOnboarding && <BackButton />}
      <div className={styles.header}>
        <h2 className={styles.title}>
          {isOnboarding ? (
            <>
              <AppIcon accountName="Make" />
              {step === 1 ? "Connect Make.com" : `Add API Key (${step}/4)`}
            </>
          ) : (
            "Add API Key"
          )}
        </h2>
        {isOnboarding ? (
          <p className={styles.description}>
            {step === 1
              ? "Connect to your Make.com instance. We will encrypt your token and securely link it to your vault."
              : "Do you have workspaces in other regions (e.g., US vs EU) that you want to compare? If so, you will need a separate API key generated by a workspace owner in that region."}
          </p>
        ) : (
          <p className={styles.description}>
            Add your API key below. You can add up to one API key per
            region/zone.
          </p>
        )}
      </div>

      {step === 1 && isOnboarding && (
        <div className={`${styles.alertBox} ${styles.infoAlert}`}>
          <Info size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div className={styles.alertContent}>
            <strong>Working across US & EU servers?</strong>
            You will need a separate API key for each zone. We will connect your
            first one now, and you can add more on the next screen.
          </div>
        </div>
      )}

      {step > 1 && isOnboarding && (
        <div className={`${styles.alertBox} ${styles.successAlert}`}>
          <CheckCircle2 size={20} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div className={styles.alertContent}>
            <strong>Connection successful!</strong>
            Your previous zone is ready. You can add another zone now, or skip
            and go straight to the deployment console.
          </div>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>Server Zone</label>
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
            placeholder="e.g., Acme Agency US"
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

        {step === 1 && isOnboarding ? (
          <ActionButton
            title={status.type === "loading" ? "Verifying..." : "Connect"}
            variant="primary"
            disabled={status.type === "loading" || !apiKey}
            type="submit"
            size="lg"
          />
        ) : (
          <div className={styles.buttonGroup}>
            {isOnboarding && (
              <ActionButton
                title="Skip"
                variant="secondary"
                onClick={handleSkip}
                type="button"
                size="lg"
              />
            )}
            <ActionButton
              title={
                status.type === "loading"
                  ? "Verifying..."
                  : step === 4 || zoneOptions.length === 1
                    ? "Add Final Connection"
                    : "Add Connection"
              }
              variant="primary"
              disabled={status.type === "loading" || !apiKey}
              type="submit"
              size="lg"
            />
          </div>
        )}
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
