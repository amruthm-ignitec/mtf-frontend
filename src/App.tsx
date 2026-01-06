import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, DocUploaderRoute, MedicalDirectorRoute } from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Summary from './pages/Summary';
import LoginPage from './components/auth/LoginPage';
import Queue from './pages/Queue';
import Upload from './pages/Upload';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Intelligence from './pages/Intelligence';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import DonorManagement from './pages/DonorManagement';
import Documents from './pages/Documents';
import PlatformFeedback from './pages/PlatformFeedback';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Header />
                  <Routes>
                    <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                    <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                    <Route path="/donors" element={<AdminRoute><DonorManagement /></AdminRoute>} />
                    <Route path="/documents/:donorId" element={<Documents />} />
                    <Route path="/queue" element={<Queue />} />
                    <Route path="/summary/:id" element={<Summary />} />
                    <Route path="/upload/:donorId?" element={<DocUploaderRoute><Upload /></DocUploaderRoute>} />
                    <Route path="/intelligence" element={<MedicalDirectorRoute><Intelligence /></MedicalDirectorRoute>} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/feedback" element={<PlatformFeedback />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
