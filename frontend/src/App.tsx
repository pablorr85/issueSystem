import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomeView, ReportIssueView, LoginView, DashboardView, OperatorTaskView, OperatorHubView } from './views';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/:tenant_id/report" element={<ReportIssueView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/work/task/:secure_token" element={<OperatorTaskView />} />
      <Route path="/work/task/:id" element={<OperatorTaskView />} />
      <Route path="/work/hub" element={<OperatorHubView />} />
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
