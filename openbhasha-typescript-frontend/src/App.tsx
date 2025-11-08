import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { MobileShell } from '@/components/layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/Loading';
import { DashboardPage } from '@/pages/Dashboard';
import { ProjectsPage, ProjectCreatePage } from '@/pages/Projects';
import { ProjectDetailPage } from '@/pages/Projects/ProjectDetailPage';
import { ProjectEditPage } from '@/pages/Projects/ProjectEditPage';
import { ProjectUserAssignPage } from '@/pages/Projects/ProjectUserAssignPage';
import { ProjectPage } from '@/pages/Projects';
import { TaskPage } from '@/pages/Task';
import { ReviewQueuePage } from '@/pages/Reviewer/ReviewQueuePage';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ParticipantRegisterPage,
} from '@/pages/Auth';
import { ProfilePage } from '@/pages/Profile';
import { ParticipantsPage } from '@/pages/Participants';
import { ParticipantDashboard } from '@/pages/Participants/ParticipantDashboard';
import { RewardsPage } from '@/pages/Rewards';
import { AdminUserManagement } from '@/pages/Admin';
import { AdminDashboard } from '@/pages/Admin/AdminDashboard';
import { ReviewerDashboard } from '@/pages/Reviewer/ReviewerDashboard';
import { NavigationTab, User } from '@/types';

// Authentication is now handled by useAuth hook
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');

  // Minimal redirect - only if user is on login page and already authenticated
  useEffect(() => {
    if (user && !isLoading && location.pathname === '/auth/login') {
      console.log('🔄 Redirecting authenticated user from login page');
      navigate('/', { replace: true });
    }
  }, [user, isLoading, location.pathname, navigate]);



  // Update active tab based on current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/projects')) {
      setActiveTab('projects');
    } else if (path.startsWith('/participants')) {
      setActiveTab('participants');
    } else if (path.startsWith('/review')) {
      setActiveTab('review');
    } else if (path.startsWith('/profile')) {
      setActiveTab('profile');
    } else if (path.startsWith('/rewards')) {
      setActiveTab('rewards');
    } else if (path === '/' || path.includes('/dashboard')) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('dashboard');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: NavigationTab) => {
    setActiveTab(tab);
    switch (tab) {
      case 'dashboard':
        // Navigate to role-specific dashboard
        if (user?.role === 'student') {
          navigate('/student/dashboard');
        } else if (user?.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (user?.role === 'reviewer') {
          navigate('/reviewer/dashboard');
        } else if (user?.role === 'participant') {
          navigate('/participant/dashboard');
        } else {
          navigate('/');
        }
        break;
      case 'projects':
        navigate('/projects');
        break;
      case 'participants':
        navigate('/participants');
        break;
      case 'rewards':
        navigate('/rewards');
        break;
      case 'review':
        navigate('/review');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  // Get page title based on current route
  const getPageTitle = (): string => {
    const path = location.pathname;
    if (path === '/') return 'Bolo';
    if (path.startsWith('/projects/')) {
      const projectId = path.split('/')[2];
      return projectId ? `Project #${projectId}` : 'Projects';
    }
    if (path.startsWith('/task/')) return '#TaskId';
    if (path.startsWith('/participants')) return 'Participants';
    if (path.startsWith('/rewards')) return 'Rewards';
    if (path.startsWith('/review')) return 'Review Queue';
    if (path.startsWith('/profile')) return 'Profile';
    return 'Bolo';
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return <Loading fullScreen message="Checking authentication..." />;
  }

  // Handle auth success - let LoginPage handle navigation
  const handleAuthSuccess = (userData: User) => {
    console.log('Auth success:', userData);
    // Navigation is handled by LoginPage, no need to force navigate here
  };

  return (
    <ErrorBoundary>
      <Routes>
        {/* Auth routes - outside of MobileShell */}
        <Route
          path="/auth/login"
          element={<LoginPage onLogin={handleAuthSuccess} />}
        />
        <Route
          path="/auth/register"
          element={<RegisterPage onRegister={handleAuthSuccess} />}
        />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/participant/register/:token"
          element={<ParticipantRegisterPage />}
        />

        {/* Explicit root route - Dashboard */}
        <Route
          path="/"
          element={
            !user ? (
              <LoginPage onLogin={handleAuthSuccess} />
            ) : (
              <MobileShell
                title={getPageTitle()}
                activeTab={activeTab}
                user={user}
                userRole={user.role}
                onTabChange={handleTabChange}
              >
                <DashboardPage user={user} />
              </MobileShell>
            )
          }
        />

        {/* Student Dashboard Route */}
        <Route
          path="/student/dashboard"
          element={
            !user ? (
              (console.log('🚫 No user for /student/dashboard - showing login'), 
              <LoginPage onLogin={handleAuthSuccess} />)
            ) : (
              (console.log('✅ User found for /student/dashboard:', user.name), 
              <MobileShell
                title={getPageTitle()}
                activeTab={activeTab}
                user={user}
                userRole={user.role}
                onTabChange={handleTabChange}
              >
                <DashboardPage user={user} />
              </MobileShell>)
            )
          }
        />

        {/* Other protected routes - inside MobileShell */}
        <Route
          path="/projects/*"
          element={
            !user ? (
              <LoginPage onLogin={handleAuthSuccess} />
            ) : (
              <MobileShell
                title={getPageTitle()}
                activeTab={activeTab}
                user={user}
                userRole={user.role}
                onTabChange={handleTabChange}
              >
                <Routes>
                  <Route path="/" element={<ProjectsPage user={user} />} />
                  <Route path="/create" element={<ProjectCreatePage />} />
                  <Route path="/:projectId" element={<ProjectDetailPage />} />
                  <Route path="/:projectId/edit" element={<ProjectEditPage />} />
                  <Route path="/:projectId/assign-users" element={<ProjectUserAssignPage />} />
                </Routes>
              </MobileShell>
            )
          }
        />

        <Route
          path="/task/*"
          element={
            !user ? (
              <LoginPage onLogin={handleAuthSuccess} />
            ) : (
              <MobileShell
                title={getPageTitle()}
                activeTab={activeTab}
                user={user}
                userRole={user.role}
                onTabChange={handleTabChange}
              >
                <Routes>
                  <Route path="/" element={<TaskPage />} />
                  <Route path="/:taskId" element={<TaskPage />} />
                </Routes>
              </MobileShell>
            )
          }
        />

        <Route
          path="/*"
          element={
            !user ? (
              <LoginPage onLogin={handleAuthSuccess} />
            ) : (
              <MobileShell
                title={getPageTitle()}
                activeTab={activeTab}
                user={user}
                userRole={user.role}
                onTabChange={handleTabChange}
              >
                <Routes>

                  {/* Projects */}
                  <Route
                    path="/projects"
                    element={<ProjectsPage user={user} />}
                  />
                  <Route path="/projects/create" element={<ProjectCreatePage />} />
                  <Route path="/project" element={<ProjectPage />} />
                  <Route path="/project/:projectId" element={<ProjectPage />} />
                  <Route
                    path="/projects/:projectId"
                    element={<ProjectDetailPage />}
                  />

                  {/* Tasks */}
                  <Route path="/task" element={<TaskPage />} />
                  <Route path="/task/:taskId" element={<TaskPage />} />

                  {/* Participants */}
                  <Route
                    path="/participants"
                    element={<ParticipantsPage />}
                  />

                  {/* Rewards */}
                  <Route
                    path="/rewards"
                    element={<RewardsPage user={user} />}
                  />

                  {/* Review */}
                  <Route path="/review" element={<ReviewQueuePage />} />

                  {/* Profile */}
                  <Route
                    path="/profile"
                    element={<ProfilePage user={user} />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard user={user} />}
                  />
                  <Route
                    path="/admin/users"
                    element={<AdminUserManagement user={user} />}
                  />

                  {/* Reviewer Routes */}
                  <Route
                    path="/reviewer/dashboard"
                    element={<ReviewerDashboard user={user} />}
                  />

                  {/* Participant Routes */}
                  <Route
                    path="/participant/dashboard"
                    element={<ParticipantDashboard user={user} />}
                  />
                </Routes>
              </MobileShell>
            )
          }
        />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
