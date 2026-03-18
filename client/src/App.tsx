import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout/MainLayout";
import LandingPage from "./containers/LandingPage/LandingPage";
import PrivacyPolicy from "./containers/LandingPage/pages/PrivacyPolicy/PrivacyPolicy";
import TermsOfService from "./containers/LandingPage/pages/TermsOfService/TermsOfService";
import Pricing from "./containers/LandingPage/pages/Pricing/Pricing";
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
    </Routes>
  );
}

export default App;
