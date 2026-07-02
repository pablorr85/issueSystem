import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import {
  HomeView,
  ReportIssueView,
  LoginView,
  DashboardStatsView,
  BacklogView,
  BoardView,
  OperatorTaskView,
  OperatorHubView
} from './views';

function AppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <DashboardStatsView />
          ) : (
            <HomeView />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/backlog"
        element={
          <ProtectedRoute>
            <BacklogView />
          </ProtectedRoute>
        }
      />
      <Route
        path="/board"
        element={
          <ProtectedRoute>
            <BoardView />
          </ProtectedRoute>
        }
      />
      <Route path="/:tenant_id/report" element={<ReportIssueView />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/work/task/:secure_token" element={<OperatorTaskView />} />
      <Route path="/work/task/:id" element={<OperatorTaskView />} />
      <Route path="/work/hub" element={<OperatorHubView />} />
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
