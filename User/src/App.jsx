import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import ApplyPage from "./pages/ApplyPage";
import ApplicationStatus from "./pages/ApplicationStatus";
import KYCPage from "./pages/KYCPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply"
          element={
            <ProtectedRoute>
              <ApplyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/status/:id"
          element={
            <ProtectedRoute>
              <ApplicationStatus />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/kyc/:id" element={
            <ProtectedRoute>
              <KYCPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
