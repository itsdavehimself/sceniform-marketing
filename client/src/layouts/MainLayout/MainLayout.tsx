import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";

const MainLayout = () => (
  <div>
    <Navbar />
    <div>
      <Outlet />
    </div>
  </div>
);

export default MainLayout;
