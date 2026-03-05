import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
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

export interface WorkspaceGroup {
  orgId: number;
  orgName: string;
  zone: string;
  teams: MakeTeam[];
}

interface MakeContextType {
  organizations: MakeOrganization[];
  teams: MakeTeam[];
  workspaceGroups: WorkspaceGroup[];
  savedKeys: any[]; // <-- Added: Context now manages your saved API keys
  availableZones: string[]; // <-- Added: Context tracks which zones are active
  activeOrg: MakeOrganization | null;
  activeTeam: MakeTeam | null;
  targetOrg: MakeOrganization | null; // <-- ADDED
  targetTeam: MakeTeam | null; // <-- ADDED
  setActiveOrgId: (id: number) => void;
  setActiveTeamId: (id: number) => void;
  setActiveWorkspace: (orgId: number, teamId: number) => void;
  setTargetWorkspace: (orgId: number, teamId: number) => void; // <-- ADDED
  isLoading: boolean;
  error: string | null;
  refreshContext: () => void; // <-- Added: The trigger to force updates
}

export const MakeContext = createContext<MakeContextType | undefined>(
  undefined,
);

export function MakeProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [organizations, setOrganizations] = useState<MakeOrganization[]>([]);
  const [workspaceGroups, setWorkspaceGroups] = useState<WorkspaceGroup[]>([]);
  const [savedKeys, setSavedKeys] = useState<any[]>([]);
  const [availableZones, setAvailableZones] = useState<string[]>([]);

  const [activeOrg, setActiveOrg] = useState<MakeOrganization | null>(null);
  const [activeTeam, setActiveTeam] = useState<MakeTeam | null>(null);
  const [targetOrg, setTargetOrg] = useState<MakeOrganization | null>(null); // <-- ADDED
  const [targetTeam, setTargetTeam] = useState<MakeTeam | null>(null); //

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshContext = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchEverything = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const headers = { Authorization: `Bearer ${token}` };

        // FETCH ORGANIZATIONS & API KEYS SIMULTANEOUSLY
        const [orgsRes, connRes] = await Promise.all([
          fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/organizations`,
            { headers },
          ),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections`, {
            headers,
          }),
        ]);

        if (!orgsRes.ok) throw new Error("Failed to fetch organizations");

        const orgsData = await orgsRes.json();
        const connData = connRes.ok
          ? await connRes.json()
          : { connections: [] };

        const orgsList: MakeOrganization[] = orgsData.organizations || [];
        setOrganizations(orgsList);

        const keys = connData.connections || [];
        setSavedKeys(keys);

        const zones = keys.map((c: any) => c.zone);
        setAvailableZones(zones);

        const groups: WorkspaceGroup[] = await Promise.all(
          orgsList.map(async (org) => {
            try {
              const teamRes = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/MakeConnections/teams?organizationId=${org.id}&zone=${org.zone}`,
                { headers },
              );
              const teamData = await teamRes.json();
              return {
                orgId: org.id,
                orgName: org.name,
                zone: org.zone,
                teams: teamData.teams || [],
              };
            } catch (err) {
              console.error(`Failed to fetch teams for org ${org.name}`, err);
              return {
                orgId: org.id,
                orgName: org.name,
                zone: org.zone,
                teams: [],
              };
            }
          }),
        );

        setWorkspaceGroups(groups);

        // Auto-select logic
        if (orgsList.length > 0) {
          setActiveOrg((prev) => {
            if (prev && orgsList.some((o) => o.id === prev.id)) return prev;
            return orgsList[0];
          });
          setTargetOrg((prev) => {
            if (prev && orgsList.some((o) => o.id === prev.id)) return prev;
            return orgsList[0];
          });

          setActiveTeam((prev) => {
            if (prev) {
              const stillExists = groups.some((g) =>
                g.teams.some((t) => t.id === prev.id),
              );
              if (stillExists) return prev;
            }
            const firstGroup = groups.find((g) => g.orgId === orgsList[0].id);
            return firstGroup?.teams[0] || null;
          });
          setTargetOrg((prev) => {
            if (prev && orgsList.some((o) => o.id === prev.id)) return prev;
            return orgsList[0];
          });
          setTargetTeam((prev) => {
            if (prev) {
              const stillExists = groups.some((g) =>
                g.teams.some((t) => t.id === prev.id),
              );
              if (stillExists) return prev;
            }
            const firstGroup = groups.find((g) => g.orgId === orgsList[0].id);
            return firstGroup?.teams[0] || null;
          });
        } else {
          setActiveOrg(null);
          setActiveTeam(null);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEverything();
  }, [isLoaded, isSignedIn, getToken, refreshTrigger]);

  const handleSetTargetWorkspace = (orgId: number, teamId: number) => {
    if (teamId) {
      for (const group of workspaceGroups) {
        const team = group.teams.find((t) => t.id === teamId);
        if (team) {
          setTargetTeam(team);

          if (targetOrg?.id !== group.orgId) {
            const org = organizations.find((o) => o.id === group.orgId);
            if (org) setTargetOrg(org);
          }
          return;
        }
      }
    }

    const org = organizations.find((o) => o.id === orgId);
    if (org) {
      setTargetOrg(org);
      const group = workspaceGroups.find((g) => g.orgId === orgId);
      setTargetTeam(group?.teams[0] || null);
    }
  };

  const handleSetActiveOrgId = (id: number) => {
    const org = organizations.find((o) => o.id === id);
    if (org) {
      setActiveOrg(org);
      const group = workspaceGroups.find((g) => g.orgId === id);
      setActiveTeam(group?.teams[0] || null);
    }
  };

  const handleSetActiveTeamId = (id: number) => {
    for (const group of workspaceGroups) {
      const team = group.teams.find((t) => t.id === id);
      if (team) {
        setActiveTeam(team);
        if (activeOrg?.id !== group.orgId) {
          const org = organizations.find((o) => o.id === group.orgId);
          if (org) setActiveOrg(org);
        }
        return;
      }
    }
  };

  const handleSetActiveWorkspace = (orgId: number, teamId: number) => {
    handleSetActiveOrgId(orgId);
    handleSetActiveTeamId(teamId);
  };

  const currentTeams =
    workspaceGroups.find((g) => g.orgId === activeOrg?.id)?.teams || [];

  return (
    <MakeContext.Provider
      value={{
        organizations,
        teams: currentTeams,
        workspaceGroups,
        savedKeys,
        availableZones,
        activeOrg,
        activeTeam,
        setActiveOrgId: handleSetActiveOrgId,
        setActiveTeamId: handleSetActiveTeamId,
        setActiveWorkspace: handleSetActiveWorkspace,
        setTargetWorkspace: handleSetTargetWorkspace,
        isLoading,
        error,
        refreshContext,
      }}
    >
      {children}
    </MakeContext.Provider>
  );
}

export function useMakeContext() {
  const context = useContext(MakeContext);
  if (context === undefined)
    throw new Error("useMakeContext must be used within a MakeProvider");
  return context;
}
