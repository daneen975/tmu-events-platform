import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Navbar from './components/shared/Navbar';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import MyEvents from './pages/MyEvents';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import AdminEventDetails from './pages/AdminEventDetails';
import Analytics from './pages/Analytics';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Student Routes - with Navbar */}
            <Route path="/" element={<><Navbar /><Home /></>} />
            <Route path="/events/:id" element={<><Navbar /><EventDetails /></>} />
            <Route path="/my-events" element={<><Navbar /><MyEvents /></>} />
            
            {/* Admin Routes - without student Navbar */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin/events/create"
              element={<ProtectedRoute><CreateEvent /></ProtectedRoute>}
            />
            <Route
              path="/admin/events/:id/edit"
              element={<ProtectedRoute><EditEvent /></ProtectedRoute>}
            />
            <Route
              path="/admin/events/:id"
              element={<ProtectedRoute><AdminEventDetails /></ProtectedRoute>}
            />
            <Route
            path="/admin/analytics"
            element={<ProtectedRoute><Analytics /></ProtectedRoute>}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;