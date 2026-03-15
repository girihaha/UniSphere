import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import BottomNav from './components/BottomNav';
import ClubsPage from './pages/ClubsPage';
import FeedPage from './pages/FeedPage';
import NetworkPage from './pages/NetworkPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ModerationDashboard from './pages/ModerationDashboard';
import MyPostsPage from './pages/MyPostsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminClubsPage from './pages/AdminClubsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FeedProvider } from './context/FeedContext';
import { ModerationProvider } from './context/ModerationContext';
import { NotificationsProvider } from './context/NotificationsContext';

type Tab = 'clubs' | 'feed' | 'network' | 'profile';

type AppRoute =
  | { kind: 'root' }
  | { kind: 'login' }
  | { kind: 'signup' }
  | { kind: 'feed' }
  | { kind: 'post'; postId: number }
  | { kind: 'network' }
  | { kind: 'clubs' }
  | { kind: 'club-profile'; clubId: number }
  | { kind: 'profile' }
  | { kind: 'account' }
  | { kind: 'myposts' }
  | { kind: 'moderation' }
  | { kind: 'adminusers' }
  | { kind: 'adminclubs' }
  | { kind: 'notifications' };

function normalizePath(pathname: string) {
  if (!pathname) return '/';

  const [pathOnly] = pathname.split(/[?#]/);
  const prefixed = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;

  if (prefixed.length > 1 && prefixed.endsWith('/')) {
    return prefixed.slice(0, -1);
  }

  return prefixed;
}

function parseRoute(pathname: string): AppRoute {
  const path = normalizePath(pathname);

  if (path === '/') return { kind: 'root' };
  if (path === '/login') return { kind: 'login' };
  if (path === '/signup') return { kind: 'signup' };
  if (path === '/feed') return { kind: 'feed' };
  if (path === '/network') return { kind: 'network' };
  if (path === '/clubs') return { kind: 'clubs' };
  if (path === '/profile') return { kind: 'profile' };
  if (path === '/account') return { kind: 'account' };
  if (path === '/myposts') return { kind: 'myposts' };
  if (path === '/moderation') return { kind: 'moderation' };
  if (path === '/admin/users') return { kind: 'adminusers' };
  if (path === '/admin/clubs') return { kind: 'adminclubs' };
  if (path === '/notifications') return { kind: 'notifications' };

  const postMatch = path.match(/^\/post\/(\d+)$/);
  if (postMatch) {
    return { kind: 'post', postId: Number(postMatch[1]) };
  }

  const clubMatch = path.match(/^\/clubs\/(\d+)$/);
  if (clubMatch) {
    return { kind: 'club-profile', clubId: Number(clubMatch[1]) };
  }

  return { kind: 'root' };
}

function getNavTab(route: AppRoute): Tab {
  switch (route.kind) {
    case 'clubs':
    case 'club-profile':
      return 'clubs';
    case 'network':
      return 'network';
    case 'profile':
    case 'account':
    case 'myposts':
    case 'moderation':
    case 'adminusers':
    case 'adminclubs':
      return 'profile';
    default:
      return 'feed';
  }
}

function MainApp() {
  const { user, logout, isLoading } = useAuth();
  const [path, setPath] = useState(() => normalizePath(window.location.pathname));
  const previousPagePathRef = useRef('/feed');
  const isAdmin = user?.role === 'super_admin' || user?.role === 'club_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const route = useMemo(() => parseRoute(path), [path]);

  const navigate = useCallback((nextPath: string, options?: { replace?: boolean }) => {
    const normalized = normalizePath(nextPath);
    const replace = options?.replace ?? false;

    if (window.location.pathname !== normalized) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', normalized);
    }

    setPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (route.kind !== 'notifications') {
      previousPagePathRef.current = path;
    }
  }, [path, route.kind]);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (route.kind !== 'login' && route.kind !== 'signup' && route.kind !== 'post') {
        navigate('/login', { replace: true });
      }
      return;
    }

    if (route.kind === 'root' || route.kind === 'login' || route.kind === 'signup') {
      navigate('/feed', { replace: true });
      return;
    }

    if (route.kind === 'moderation' && !isAdmin) {
      navigate('/profile', { replace: true });
      return;
    }

    if ((route.kind === 'adminusers' || route.kind === 'adminclubs') && !isSuperAdmin) {
      navigate('/profile', { replace: true });
    }
  }, [isAdmin, isLoading, isSuperAdmin, navigate, route.kind, user]);

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-dvh flex items-center justify-center">
        <div className="text-white text-base font-medium">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (route.kind === 'signup') {
      return <SignupPage onGoLogin={() => navigate('/login')} />;
    }

    return <LoginPage onGoSignup={() => navigate('/signup')} />;
  }

  const openNotifications = () => {
    if (route.kind !== 'notifications') {
      previousPagePathRef.current = path;
    }
    navigate('/notifications');
  };

  const closeNotifications = () => {
    navigate(previousPagePathRef.current === '/notifications' ? '/feed' : previousPagePathRef.current);
  };

  const handleTabChange = (tab: Tab) => {
    const tabPath =
      tab === 'feed' ? '/feed' : tab === 'clubs' ? '/clubs' : tab === 'network' ? '/network' : '/profile';
    navigate(tabPath);
  };

  const renderPage = () => {
    switch (route.kind) {
      case 'feed':
        return <FeedPage onOpenNotifications={openNotifications} />;
      case 'post':
        return (
          <FeedPage
            onOpenNotifications={openNotifications}
            sharedPostId={route.postId}
            onSharedPostClose={() => navigate('/feed', { replace: true })}
          />
        );
      case 'network':
        return <NetworkPage onOpenNotifications={openNotifications} />;
      case 'clubs':
        return (
          <ClubsPage
            onOpenClub={(clubId) => navigate(`/clubs/${clubId}`)}
            onBackFromClub={() => navigate('/clubs')}
          />
        );
      case 'club-profile':
        return (
          <ClubsPage
            selectedClubId={route.clubId}
            onOpenClub={(clubId) => navigate(`/clubs/${clubId}`)}
            onBackFromClub={() => navigate('/clubs')}
          />
        );
      case 'myposts':
        return <MyPostsPage />;
      case 'moderation':
        return <ModerationDashboard />;
      case 'adminusers':
        return <AdminUsersPage />;
      case 'adminclubs':
        return <AdminClubsPage />;
      case 'account':
      case 'profile':
        return (
          <ProfilePage
            onLogout={logout}
            onOpenMyPosts={() => navigate('/myposts')}
            onOpenModeration={isAdmin ? () => navigate('/moderation') : undefined}
            onOpenAdminUsers={isSuperAdmin ? () => navigate('/admin/users') : undefined}
            onOpenAdminClubs={isSuperAdmin ? () => navigate('/admin/clubs') : undefined}
            onOpenNotifications={openNotifications}
          />
        );
      case 'notifications':
        return <NotificationsPage onClose={closeNotifications} />;
      default:
        return <FeedPage onOpenNotifications={openNotifications} />;
    }
  };

  const navHidden = route.kind === 'notifications';

  return (
    <div className="gradient-bg min-h-dvh">
      <div className="page-container relative">
        <div key={path} className="slide-up">
          {renderPage()}
        </div>

        {!navHidden && <BottomNav active={getNavTab(route)} onChange={handleTabChange} />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FeedProvider>
        <ModerationProvider>
          <NotificationsProvider>
            <MainApp />
          </NotificationsProvider>
        </ModerationProvider>
      </FeedProvider>
    </AuthProvider>
  );
}
