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
import ApiSettings from "./containers/Settings/components/ApiSettings/ApiSettings";
import AddApiKey from "./containers/Settings/components/AddApiKey/AddApiKey";
import PrivacyPolicy from "./containers/LandingPage/pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./containers/LandingPage/pages/TermsOfService/TermsOfService";
import Pricing from "./containers/LandingPage/pages/Pricing/Pricing";
import AdminRoute from "./layouts/AdminRoute";
import Changelog from "./containers/LandingPage/pages/Changelog/Changelog";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/tos" element={<TermsOfService />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/changelog" element={<Changelog />} />
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
        <Route path="settings">
          <Route index element={<Settings />} />
          <Route
            path="api-key/:uid"
            element={
              <AdminRoute>
                <ApiSettings />
              </AdminRoute>
            }
          />
          <Route
            path="api-key/add"
            element={
              <AdminRoute>
                <AddApiKey />
              </AdminRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
