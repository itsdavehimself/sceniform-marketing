import SidebarButton from "./SidebarButton/SidebarButton";
import styles from "./Sidebar.module.scss";
import { useNavigate } from "react-router-dom";
import { Brain, Cable, PanelsTopLeft, Settings, Share2 } from "lucide-react";
import logo from "../../assets/diffra_logo.png";
import WorkspaceDropdown from "../../components/WorkspaceDropdown/WorkspaceDropdown";
import { useMakeContext } from "../../context/MakeContext";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const {
    workspaceGroups,
    activeOrg,
    activeTeam,
    setActiveWorkspace,
    availableZones,
  } = useMakeContext();

  return (
    <div className={styles.sideBar}>
      <section className={styles.branding}>
        <img className={styles.logo} src={logo} alt="Diffra Logo" />
        <h3 className={styles.diffra}>Diffra</h3>
      </section>

      <section className={styles.workspaceSelector}>
        <div className={styles.selectorGroup}>
          <span className={styles.selectorLabel}>Workspace</span>
          <WorkspaceDropdown
            groups={workspaceGroups}
            selectedOrgId={activeOrg?.id}
            selectedTeamId={activeTeam?.id}
            onSelect={(orgId, teamId) => setActiveWorkspace(orgId, teamId)}
            placeholder="Select Workspace"
            availableZones={availableZones}
          />
        </div>
      </section>

      <section className={styles.linkGroup}>
        {/* <SidebarButton
          title="Dashboard"
          path="dashboard"
          icon={PanelsTopLeft}
          navigation={() => navigate("/dashboard")}
        /> */}
        <SidebarButton
          title="Scenarios"
          path="scenarios"
          icon={Share2}
          navigation={() => navigate("/scenarios")}
        />
        {/* <SidebarButton
          title="Agents"
          path="agents"
          icon={Brain}
          navigation={() => navigate("/agents")}
        />
        <SidebarButton
          title="Connections"
          path="connections"
          icon={Cable}
          navigation={() => navigate("/connections")}
        /> */}
        <SidebarButton
          title="Settings"
          path="settings"
          icon={Settings}
          navigation={() => navigate("/settings")}
        />
      </section>
    </div>
  );
};

export default Sidebar;
