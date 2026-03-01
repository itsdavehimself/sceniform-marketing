import SidebarButton from "./SidebarButton/SidebarButton";
import styles from "./Sidebar.module.scss";
import { useNavigate } from "react-router-dom";
import { Brain, Cable, PanelsTopLeft, Settings, Share2 } from "lucide-react";
import logo from "../../assets/baseflo_logo.png";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.sideBar}>
      <section className={styles.branding}>
        <img className={styles.logo} src={logo}></img>
        <h3 className={styles.baseflo}>Baseflo</h3>
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
