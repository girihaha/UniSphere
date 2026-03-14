import { useState } from 'react';
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

type Tab =
  | 'clubs'
  | 'feed'
  | 'network'
  | 'profile'
  | 'moderation'
  | 'myposts'
  | 'adminusers'
  | 'adminclubs';

type AuthScreen = 'login' | 'signup';

function MainApp() {
  const { user, logout, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('feed');
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="gradient-bg min-h-dvh flex items-center justify-center">
        <div className="text-white text-base font-medium">Loading...</div>
      </div>
    );
  }

  if (!user) {
    if (authScreen === 'signup') {
      return <SignupPage onGoLogin={() => setAuthScreen('login')} />;
    }
    return <LoginPage onGoSignup={() => setAuthScreen('signup')} />;
  }

  const isAdmin = user.role === 'super_admin' || user.role === 'club_admin';
  const isSuperAdmin = user.role === 'super_admin';

  const openNotifications = () => setNotificationsOpen(true);

  const renderPage = () => {
    switch (activeTab) {
      case 'clubs':
        return <ClubsPage />;
      case 'feed':
        return <FeedPage onOpenNotifications={openNotifications} />;
      case 'network':
        return <NetworkPage onOpenNotifications={openNotifications} />;
      case 'moderation':
        return <ModerationDashboard />;
      case 'myposts':
        return <MyPostsPage />;
      case 'adminusers':
        return isSuperAdmin ? <AdminUsersPage /> : <ProfilePage onLogout={logout} onOpenNotifications={openNotifications} />;
      case 'adminclubs':
        return isSuperAdmin ? <AdminClubsPage /> : <ProfilePage onLogout={logout} onOpenNotifications={openNotifications} />;
      case 'profile':
        return (
          <ProfilePage
            onLogout={logout}
            onOpenMyPosts={() => handleTabChange('myposts')}
            onOpenModeration={isAdmin ? () => handleTabChange('moderation') : undefined}
            onOpenAdminUsers={isSuperAdmin ? () => handleTabChange('adminusers') : undefined}
            onOpenAdminClubs={isSuperAdmin ? () => handleTabChange('adminclubs') : undefined}
            onOpenNotifications={openNotifications}
          />
        );
      default:
        return <FeedPage onOpenNotifications={openNotifications} />;
    }
  };

  const navTab: 'clubs' | 'feed' | 'network' | 'profile' =
    activeTab === 'moderation' ||
    activeTab === 'myposts' ||
    activeTab === 'adminusers' ||
    activeTab === 'adminclubs'
      ? 'profile'
      : activeTab;

  return (
    <div className="gradient-bg min-h-dvh">
      <div className="page-container relative">
        <div key={activeTab} className="slide-up">
          {renderPage()}
        </div>

        {!notificationsOpen && <BottomNav active={navTab} onChange={handleTabChange} />}
      </div>

      {notificationsOpen && (
        <NotificationsPage onClose={() => setNotificationsOpen(false)} />
      )}
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