import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/clerk-react";

export interface MakeOrganization {
  id: number;
  name: string;
  zone: string;
}

export interface MakeTeam {
  id: number;
  name: string;
}

interface MakeContextType {
  organizations: MakeOrganization[];
  teams: MakeTeam[];
  activeOrg: MakeOrganization | null;
  activeTeam: MakeTeam | null;
  setActiveOrgId: (id: number) => void;
  setActiveTeamId: (id: number) => void;
  isLoading: boolean;
  error: string | null;
}

const MakeContext = createContext<MakeContextType | undefined>(undefined);

export function MakeProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [organizations, setOrganizations] = useState<MakeOrganization[]>([]);
  const [teams, setTeams] = useState<MakeTeam[]>([]);

  const [activeOrg, setActiveOrg] = useState<MakeOrganization | null>(null);
  const [activeTeam, setActiveTeam] = useState<MakeTeam | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    if (organizations.length > 0 || !isLoading) return;

    const fetchOrgs = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/organizations`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch organizations");

        const data = await response.json();

        const orgsList = data.organizations || [];
        setOrganizations(orgsList);

        if (orgsList.length > 0) {
          setActiveOrg(orgsList[0]);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgs();
  }, [isLoaded, isSignedIn, getToken]);

  useEffect(() => {
    if (!activeOrg) return;

    const fetchTeams = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/teams?organizationId=${activeOrg.id}&zone=${activeOrg.zone}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (!response.ok) throw new Error("Failed to fetch teams");

        const data = await response.json();

        const teamsList = data.teams || [];
        setTeams(teamsList);

        if (teamsList.length > 0) {
          setActiveTeam(teamsList[0]);
        } else {
          setActiveTeam(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [activeOrg, getToken]);

  const handleSetActiveOrgId = (id: number) => {
    const org = organizations.find((o) => o.id === id);
    if (org) {
      setActiveOrg(org);
      setActiveTeam(null);
      setTeams([]);
    }
  };

  const handleSetActiveTeamId = (id: number) => {
    const team = teams.find((t) => t.id === id);
    if (team) setActiveTeam(team);
  };

  return (
    <MakeContext.Provider
      value={{
        organizations,
        teams,
        activeOrg,
        activeTeam,
        setActiveOrgId: handleSetActiveOrgId,
        setActiveTeamId: handleSetActiveTeamId,
        isLoading,
        error,
      }}
    >
      {children}
    </MakeContext.Provider>
  );
}

export function useMakeContext() {
  const context = useContext(MakeContext);
  if (context === undefined) {
    throw new Error("useMakeContext must be used within a MakeProvider");
  }
  return context;
}
