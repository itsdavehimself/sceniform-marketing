import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import styles from "./WithSidebar.module.scss";

const WithSidebar: React.FC = () => {
  return (
    <div className={styles.sidebarLayout}>
      <Sidebar />
      <main className={styles.mainContainer}>
        <Outlet />
      </main>
    </div>
  );
};

export default WithSidebar;
