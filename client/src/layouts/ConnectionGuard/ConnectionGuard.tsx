import { useEffect, useState } from "react";
import { useAuth, useUser, useOrganizationList } from "@clerk/clerk-react";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./ConnectionGuard.module.scss";

export default function ConnectionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn, orgId } = useAuth();
  const { user } = useUser();
  const { setActive } = useOrganizationList();

  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    const initializeWorkspace = async () => {
      try {
        const defaultOrgId = user.unsafeMetadata?.defaultOrgId as
          | string
          | undefined;

        if (defaultOrgId && orgId !== defaultOrgId && setActive) {
          await setActive({ organization: defaultOrgId });
          return;
        }

        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/status`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          const { hasConnection, hasActiveSubscription } = data;
          const isOnboardingPath = location.pathname.includes("/onboarding");
          const currentSearch = location.search;

          if (!hasActiveSubscription) {
            if (!isOnboardingPath || currentSearch !== "?step=pricing") {
              navigate("/onboarding?step=pricing");
            }
          } else if (!hasConnection) {
            if (!isOnboardingPath || currentSearch !== "?step=connect") {
              navigate("/onboarding?step=connect");
            }
          } else if (
            hasConnection &&
            hasActiveSubscription &&
            isOnboardingPath
          ) {
            navigate("/scenarios");
          }
        }
      } catch (error) {
        console.error("Failed to check workspace status:", error);
      } finally {
        setIsChecking(false);
      }
    };

    initializeWorkspace();
  }, [
    isLoaded,
    isSignedIn,
    user,
    orgId,
    setActive,
    getToken,
    navigate,
    location.pathname,
    location.search,
  ]);

  if (isChecking) {
    return (
      <div className={styles.loading}>
        <LoadingSpinner dimensions={{ x: 6, y: 6 }} />
      </div>
    );
  }

  return <>{children}</>;
}
