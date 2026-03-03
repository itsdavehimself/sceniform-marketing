import SidebarButton from "./SidebarButton/SidebarButton";
import styles from "./Sidebar.module.scss";
import { useNavigate } from "react-router-dom";
import { Brain, Cable, PanelsTopLeft, Settings, Share2 } from "lucide-react";
import logo from "../../assets/diffra_logo.png";
import Dropdown from "../../components/Dropdown/Dropdown";
import { useMakeContext } from "../../context/MakeContext";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const {
    organizations,
    teams,
    activeOrg,
    activeTeam,
    setActiveOrgId,
    setActiveTeamId,
  } = useMakeContext();

  const orgOptions = organizations.map((org) => ({
    label: org.name,
    value: org.id,
  }));

  const teamOptions = teams.map((team) => ({
    label: team.name,
    value: team.id,
  }));

  return (
    <div className={styles.sideBar}>
      <section className={styles.branding}>
        <img className={styles.logo} src={logo} alt="Diffra Logo" />
        <h3 className={styles.diffra}>Diffra</h3>
      </section>

      <section className={styles.workspaceSelector}>
        <div className={styles.selectorGroup}>
          <span className={styles.selectorLabel}>Organization</span>
          <Dropdown
            options={orgOptions}
            value={activeOrg?.id || ""}
            onChange={(val) => setActiveOrgId(Number(val))}
            placeholder="Select Organization"
          />
        </div>

        <div className={styles.selectorGroup}>
          <span className={styles.selectorLabel}>Team</span>
          <Dropdown
            options={teamOptions}
            value={activeTeam?.id || ""}
            onChange={(val) => setActiveTeamId(Number(val))}
            placeholder="Select Team"
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
