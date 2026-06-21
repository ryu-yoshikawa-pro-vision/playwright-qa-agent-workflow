import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DemoControlsPage } from '@/pages/DemoControlsPage';
import { ReleasesPage } from '@/pages/ReleasesPage';
import { ReleaseOverviewPage } from '@/pages/ReleaseOverviewPage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
          <Route path="/releases/:releaseId" element={<ReleaseOverviewPage />} />
          <Route path="/releases/:releaseId/tests" element={<PlaceholderPage />} />
          <Route path="/releases/:releaseId/defects" element={<PlaceholderPage />} />
          <Route path="/releases/:releaseId/risks" element={<PlaceholderPage />} />
          <Route path="/releases/:releaseId/decision" element={<PlaceholderPage />} />
          <Route path="/releases/:releaseId/evidence-pack" element={<PlaceholderPage />} />
          <Route path="/activity-log" element={<PlaceholderPage />} />
          <Route path="/demo-controls" element={<DemoControlsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
