// AÑADE LOS IMPORTS DE REACT ROUTER Y EL CONTEXTO
import { Routes, Route, Navigate } from 'react-router-dom';
import useUserStore from './stores/useUserStore';

// Importa tus componentes existentes
import AuthForm from './AuthForm';

// Importa las páginas con lazy loading
import { lazy, Suspense, useEffect, useState } from 'react';
import OnboardingGuard from './components/OnboardingGuard';

// Importar LoadingState reutilizable
import LoadingState from './components/LoadingState';

// Componente de carga mejorado
const LoadingSpinner = () => (
  <LoadingState 
    message="Cargando..." 
    variant="spinner" 
    fullScreen 
  />
);

// Lazy loading de páginas
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const WeightTrackingPage = lazy(() => import('./pages/WeightTrackingPage'));
const DietPage = lazy(() => import('./pages/DietPage'));
const RoutinesPage = lazy(() => import('./pages/RoutinesPage'));
const RoutineDetailPage = lazy(() => import('./pages/RoutineDetailPage'));
const ActiveWorkoutPage = lazy(() => import('./pages/ActiveWorkoutPage'));
const DailyLogPage = lazy(() => import('./pages/DailyLogPage'));
const CalendarPage = lazy(() => import('./pages/CalendarPage'));
const WelcomePage = lazy(() => import('./pages/WelcomePage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const InvitePage = lazy(() => import('./pages/InvitePage'));
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage'));
const CoachDashboard = lazy(() => import('./pages/CoachDashboard'));
const CoachClientDetail = lazy(() => import('./pages/CoachClientDetail'));
const TemplatesPage = lazy(() => import('./pages/TemplatesPage'));
const ExercisesPage = lazy(() => import('./pages/ExercisesPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const CheckInPage = lazy(() => import('./pages/CheckInPage'));
const NotificationsCenterPage = lazy(() => import('./pages/NotificationsCenterPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));

// Importación de ErrorBoundary y ToastContainer
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import OfflineBanner from './components/OfflineBanner';
import OfflineIndicator from './components/OfflineIndicator';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import GlobalSearch from './components/GlobalSearch';
import SkipLink from './components/SkipLink';
import AriaLiveRegion from './components/AriaLiveRegion';
import ApiLogViewer from './components/ApiLogViewer';
import { initAnalytics, trackPageView } from './utils/analytics';
import { useLocation } from 'react-router-dom';
import { getLogs } from './utils/apiRecorder';

// --- Componente para Proteger Rutas ---
const ProtectedRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Si no está autenticado, redirige al AuthForm
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// --- Componente para Proteger Rutas SOLO para administradores ---
const AdminRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const isAdmin = useUserStore((state) => state.isAdmin());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- Componente para Proteger Rutas SOLO para coaches ---
const CoachRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);
  const isCoach = useUserStore((state) => state.isCoach());
  const isAdmin = useUserStore((state) => state.isAdmin());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isCoach && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- Componente para proteger rutas de cliente ---
// Permite acceso a clientes, coaches y admins (coaches y admins pueden ver contenido de clientes)
const ClientRoute = ({ children }) => {
  const user = useUserStore((state) => state.user);
  const loading = useUserStore((state) => state.loading);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-black">
        <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Permitir acceso a todos los usuarios autenticados (clientes, coaches y admins)
  // Los coaches y admins pueden navegar a las secciones de cliente para gestionar contenido
  return children;
};


function App() {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated());
  const isAdmin = useUserStore((state) => state.isAdmin());
  const isCoach = useUserStore((state) => state.isCoach());
  const location = useLocation();
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [apiLogViewerOpen, setApiLogViewerOpen] = useState(false);

  // Inicializar analytics al montar
  useEffect(() => {
    initAnalytics();
  }, []);

  // Trackear cambios de página
  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+Shift+L to open API log viewer (only in dev mode)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'L') {
        if (import.meta.env.DEV) {
          e.preventDefault();
          setApiLogViewerOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Expose API logs to window for console access
  useEffect(() => {
    if (import.meta.env.DEV) {
      window.__API_LOGS__ = {
        getLogs,
        open: () => setApiLogViewerOpen(true),
        close: () => setApiLogViewerOpen(false),
      };
    }
  }, []);

  // El componente se renderizará siempre, las rutas se encargan de la vista
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FAF3E1] dark:bg-black transition-colors duration-300">
        <SkipLink />
        <AriaLiveRegion id="main-announcer" />
        <OfflineBanner />
        <OfflineIndicator />
        <PWAInstallPrompt />
        <GlobalSearch open={globalSearchOpen} onOpenChange={setGlobalSearchOpen} />
        {apiLogViewerOpen && <ApiLogViewer onClose={() => setApiLogViewerOpen(false)} />}
        <ToastContainer />
        <Suspense fallback={<LoadingSpinner />}>
          <main id="main-content" role="main">
          <Routes>

        {/* Ruta Base - Landing Page */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              isAdmin ? (
                <Navigate to="/admin" replace />
              ) : isCoach ? (
                <Navigate to="/coach/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <LandingPage />
            )
          } 
        />

        {/* Rutas Públicas de Login y Registro */}
        <Route path="/login" element={<AuthForm />} />
        <Route path="/register" element={<AuthForm />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/invite/:token" element={<InvitePage />} />

        {/* Ruta de Selección de Rol (Protegida) */}
        <Route
          path="/select-role"
          element={
            <ProtectedRoute>
              <RoleSelectionPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta de Bienvenida/Onboarding (Protegida) */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <OnboardingGuard>
                <WelcomePage />
              </OnboardingGuard>
            </ProtectedRoute>
          }
        />

        {/* Ruta Dashboard (Protegida) - Redirige admins y coaches a sus dashboards */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <Dashboard />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Seguimiento de Peso (Protegida) */}
        <Route
          path="/weight"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <WeightTrackingPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Dieta (Protegida) */}
        <Route
          path="/diet"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <DietPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Rutas de Rutinas (Protegidas) */}
        <Route
          path="/routines"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <RoutinesPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/routines/:id"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <RoutineDetailPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/routines/:routineId/workout"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <ActiveWorkoutPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Registro Diario de Ejercicios (Protegida) */}
        <Route
          path="/daily-log"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <DailyLogPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Calendario (Protegida) */}
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <CalendarPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Ejercicios (Protegida) */}
        <Route
          path="/exercises"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <ExercisesPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Logros */}
        <Route
          path="/achievements"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <AchievementsPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Check-in Semanal */}
        <Route
          path="/checkin"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <CheckInPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Centro de Notificaciones */}
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <NotificationsCenterPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Progreso Avanzado */}
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <ProgressPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Ruta de Mensajería */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <ClientRoute>
                <OnboardingGuard>
                  <MessagesPage />
                </OnboardingGuard>
              </ClientRoute>
            </ProtectedRoute>
          }
        />

        {/* Rutas del Coach */}
        <Route
          path="/coach/dashboard"
          element={
            <CoachRoute>
              <CoachDashboard />
            </CoachRoute>
          }
        />
        <Route
          path="/coach/client/:id"
          element={
            <CoachRoute>
              <CoachClientDetail />
            </CoachRoute>
          }
        />
        <Route
          path="/coach/templates"
          element={
            <CoachRoute>
              <TemplatesPage />
            </CoachRoute>
          }
        />

        {/* Ruta de Administración (solo administradores) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Redirige rutas de auth obsoletas */}
        <Route
          path="/auth"
          element={<Navigate to="/login" replace />}
        />

        {/* Redirección para el 404 simple */}
        <Route path="*" element={<div className="p-8 text-center text-xl" role="alert">404 | Página no encontrada</div>} />
          </Routes>
          </main>
        </Suspense>
      </div>
    </ErrorBoundary>
  );
}

export default App;
