import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./ConnectionGuard.module.scss";

export default function ConnectionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const checkVaultStatus = async () => {
      try {
        const token = await getToken();

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();

          if (!data.hasConnection && location.pathname !== "/onboarding") {
            navigate("/onboarding");
          } else if (
            data.hasConnection &&
            location.pathname === "/onboarding"
          ) {
            navigate("/scenarios");
          }
        }
      } catch (error) {
        console.error("Failed to check vault status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkVaultStatus();
  }, [isLoaded, isSignedIn, getToken, navigate, location.pathname]);

  if (isChecking) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner dimensions={{ x: 6, y: 6 }} />
      </div>
    );
  }

  return <>{children}</>;
}
