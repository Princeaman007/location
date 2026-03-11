import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import VehicleCatalog from './pages/VehicleCatalog';
import VehicleDetail from './pages/VehicleDetail';
import BookingProcess from './pages/BookingProcess';
import ClientDashboard from './pages/ClientDashboard';
import ChauffeurDashboard from './pages/ChauffeurDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AirportTransfer from './pages/AirportTransfer';
import ReservationDetail from './pages/ReservationDetail';
import NewReview from './pages/NewReview';
import About from './pages/About';
import FAQ from './pages/FAQ';
import TermsConditions from './pages/TermsConditions';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const { token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setAuth(data.data, token);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setIsInitialized(true);
    };
    initAuth();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Layout Component
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
          <Route path="/reset-password/:resetToken" element={<Layout><ResetPassword /></Layout>} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/vehicles" element={<Layout><VehicleCatalog /></Layout>} />
          <Route path="/vehicles/:id" element={<Layout><VehicleDetail /></Layout>} />
          <Route path="/airport-transfer" element={<Layout><AirportTransfer /></Layout>} />

          {/* Protected Routes - Client */}
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <Layout><BookingProcess /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations/:id"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <Layout><ReservationDetail /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <Layout><ClientDashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviews/new"
            element={
              <ProtectedRoute allowedRoles={['client']}>
                <NewReview />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Chauffeur */}
          <Route
            path="/chauffeur/dashboard"
            element={
              <ProtectedRoute allowedRoles={['chauffeur']}>
                <Layout><ChauffeurDashboard /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Layout><AdminDashboard /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Legal & Info Pages */}
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/faq" element={<Layout><FAQ /></Layout>} />
          <Route path="/terms-conditions" element={<Layout><TermsConditions /></Layout>} />
          <Route path="/privacy-policy" element={<Layout><PrivacyPolicy /></Layout>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#2C3E50',
              color: '#fff',
            },
            success: {
              iconTheme: {
                primary: '#27AE60',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#E74C3C',
                secondary: '#fff',
              },
            },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
