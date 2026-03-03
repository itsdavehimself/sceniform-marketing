import { Routes, Route } from "react-router-dom";
import styles from "./App.module.scss";
import ProtectedRoute from "./layouts/ProtectedRoute";
import WithSidebar from "./layouts/WithSidebar/WithSidebar";
import Settings from "./containers/Settings/Settings";
import Scenarios from "./containers/Scenarios/Scenarios";
import MainLayout from "./layouts/MainLayout/MainLayout";
import LandingPage from "./containers/LandingPage/LandingPage";
import Dashboard from "./containers/Dashboard/Dashboard";
import Onboarding from "./containers/Onboarding/Onboarding";
import ConnectionGuard from "./layouts/ConnectionGuard/ConnectionGuard";
import { MakeProvider } from "./context/MakeContext";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
      </Route>

      <Route
        path="/onboarding"
        element={
          <ProtectedRoute>
            <ConnectionGuard>
              <Onboarding />
            </ConnectionGuard>
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <ConnectionGuard>
              <MakeProvider>
                <WithSidebar />
              </MakeProvider>
            </ConnectionGuard>
          </ProtectedRoute>
        }
      >
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        <Route path="/scenarios" element={<Scenarios />} />
        {/* <Route path="/agents" />
        <Route path="/connections" /> */}
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
