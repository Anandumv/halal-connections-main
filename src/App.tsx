import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { Toaster } from '@/components/ui/toaster';
import { useState, Suspense, lazy, useEffect } from 'react';

// Lazy load components with error boundaries
const Index = lazy(() => import('@/pages/Index'));
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const BrowseProfiles = lazy(() => import('@/pages/BrowseProfiles'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminManagement = lazy(() => import('@/pages/AdminManagement'));
const Settings = lazy(() => import('@/pages/Settings'));
const Profile = lazy(() => import('@/pages/Profile'));
const Messages = lazy(() => import('@/pages/Messages'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Loading component
function LoadingSpinner() {
  return (
    <div className="min-h-screen animated-bg honeycomb-bg flex items-center justify-center p-4">
      <div className="text-center max-w-sm mx-auto">
        <div className="relative mb-8">
          {/* Flying Honey Bee */}
          <div className="relative w-32 h-32 mx-auto flying-bee">
            {/* Bee Body */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full border-2 border-black"></div>
            
            {/* Bee Wings */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-12">
              <div className="absolute top-0 left-0 w-8 h-6 bg-amber-300/60 rounded-full bee-wing" style={{ animationDelay: '0s' }}></div>
              <div className="absolute top-0 right-0 w-8 h-6 bg-amber-300/60 rounded-full bee-wing" style={{ animationDelay: '0.1s' }}></div>
            </div>
            
            {/* Bee Stripes */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-8">
              <div className="absolute top-1 left-2 w-2 h-6 bg-background rounded-full"></div>
              <div className="absolute top-1 left-6 w-2 h-6 bg-background rounded-full"></div>
              <div className="absolute top-1 left-10 w-2 h-6 bg-background rounded-full"></div>
            </div>
            
            {/* Bee Antennae */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-8">
              <div className="absolute top-0 left-1 w-0.5 h-3 bg-background rounded-full transform -rotate-12"></div>
              <div className="absolute top-0 right-1 w-0.5 h-3 bg-background rounded-full transform rotate-12"></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
                          <h2 className="text-3xl font-bold text-foreground tracking-wide">BEE HIVE MATCH</h2>
          <p className="text-amber-400 text-lg font-medium">Loading your experience...</p>
        </div>
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}

// Error boundary component
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Component Error</h1>
        <p className="text-muted-foreground mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-amber-400 text-black px-4 py-2 rounded hover:bg-amber-500"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

// Wrapper component with error boundary
function ComponentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}

// Protected route component for admin-only routes
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  if (authLoading || adminLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Protected route component for user-only routes
function UserRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  if (authLoading || adminLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Route component that redirects based on user role
function RoleBasedRedirect() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdminStatus();

  if (authLoading || adminLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}

function App() {
  const [error, setError] = useState<string | null>(null);
  
  // Add debugging for environment variables
  useEffect(() => {
    console.log('Environment Variables Check:');
    console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing');
    console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  }, []);
  
  try {
    const { user, loading: authLoading, error: authError, session } = useAuth();
    const { isAdmin, loading: adminLoading, error: adminError } = useAdminStatus();

    // Add debugging
    console.log('App State:', { user, authLoading, authError, adminLoading, adminError });

    if (error || authError || adminError) {
      console.log('Rendering error state:', { error, authError, adminError });
      return (
        <div className="min-h-screen bg-red-900 text-foreground flex items-center justify-center p-4">
          <div className="text-center max-w-2xl bg-white text-black p-8 rounded-lg shadow-2xl">
            <h1 className="text-3xl font-bold text-red-600 mb-6">🚨 Configuration Error</h1>
            <p className="text-lg mb-6 text-gray-800">{error || authError || adminError}</p>
            
            {(authError && authError.includes('environment variables')) && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6 text-left">
                <h3 className="font-bold text-yellow-800 mb-2">Missing Environment Variables:</h3>
                <p className="text-sm text-yellow-700 mb-2">You need to set these in Vercel:</p>
                <ul className="list-disc list-inside text-sm text-yellow-700">
                  <li>VITE_SUPABASE_URL</li>
                  <li>VITE_SUPABASE_ANON_KEY</li>
                </ul>
                <p className="text-sm text-yellow-700 mt-2">
                  Go to Vercel Dashboard → Your Project → Settings → Environment Variables
                </p>
              </div>
            )}
            
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-foreground px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    // Show loading spinner while authentication is being determined
    if (authLoading || adminLoading) {
      console.log('Rendering loading state');
      return <LoadingSpinner />;
    }

    console.log('Rendering main app');
    return (
      <Router>
        <div className="min-h-screen animated-bg honeycomb-bg">
          <Routes>
            <Route path="/" element={
              <ComponentWrapper>
                {user ? <RoleBasedRedirect /> : <Index />}
              </ComponentWrapper>
            } />
            <Route path="/auth" element={
              <ComponentWrapper>
                {user ? <RoleBasedRedirect /> : <Auth />}
              </ComponentWrapper>
            } />
            <Route path="/reset-password" element={
              <ComponentWrapper>
                <ResetPassword />
              </ComponentWrapper>
            } />
            <Route path="/dashboard" element={
              <ComponentWrapper>
                <UserRoute>
                  <Dashboard />
                </UserRoute>
              </ComponentWrapper>
            } />
            <Route path="/my-matches" element={
              <ComponentWrapper>
                <UserRoute>
                  <BrowseProfiles />
                </UserRoute>
              </ComponentWrapper>
            } />
            <Route path="/admin" element={
              <ComponentWrapper>
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              </ComponentWrapper>
            } />
            <Route path="/admin/management" element={
              <ComponentWrapper>
                <AdminRoute>
                  <AdminManagement />
                </AdminRoute>
              </ComponentWrapper>
            } />
            <Route path="/settings" element={
              <ComponentWrapper>
                <UserRoute>
                  <Settings />
                </UserRoute>
              </ComponentWrapper>
            } />
            <Route path="/profile" element={
              <ComponentWrapper>
                <UserRoute>
                  <Profile />
                </UserRoute>
              </ComponentWrapper>
            } />
            <Route path="/messages" element={
              <ComponentWrapper>
                <UserRoute>
                  <Messages />
                </UserRoute>
              </ComponentWrapper>
            } />
            <Route path="/404" element={
              <ComponentWrapper>
                <NotFound />
              </ComponentWrapper>
            } />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    );
  } catch (err) {
    console.error('App Error:', err);
    return (
      <div className="min-h-screen bg-red-900 text-foreground flex items-center justify-center p-4">
        <div className="text-center max-w-2xl bg-white text-black p-8 rounded-lg shadow-2xl">
          <h1 className="text-3xl font-bold text-red-600 mb-6">🚨 Application Error</h1>
          <p className="text-lg mb-6 text-gray-800">{err instanceof Error ? err.message : 'Unknown error occurred'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 text-foreground px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;
