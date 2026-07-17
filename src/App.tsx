import { Route, Routes } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import ComingSoonPage from "@/pages/coming-soon";
import DashboardPage from "@/pages/dashboard";
import LoginPage from "@/pages/login";
import RolesPage from "@/pages/roles";
import UsersPage from "@/pages/users";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/roles" element={<RolesPage />} />
        <Route path="/leads" element={<ComingSoonPage title="Leads" />} />
        <Route path="/calls" element={<ComingSoonPage title="Calls" />} />
        <Route path="/call-minutes" element={<ComingSoonPage title="Call Minutes" />} />
        <Route path="*" element={<ComingSoonPage title="Not found" />} />
      </Route>
    </Routes>
  );
}
