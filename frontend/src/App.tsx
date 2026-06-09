import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomeView, ReportIssueView, LoginView, DashboardView } from './views';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/:tenant_id/report" element={<ReportIssueView />} />
      <Route path="/login" element={<LoginView />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardView />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
