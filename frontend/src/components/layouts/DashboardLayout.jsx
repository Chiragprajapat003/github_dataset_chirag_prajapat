import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, getProfile } from '../../store/slices/authSlice';
import { 
  LayoutDashboard, 
  BarChart3, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Github,
  Database
} from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Synchronize authenticated user profile information on mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  // Toggle theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { name: 'Dataset Collections', path: '/dashboard', icon: Database },
    { name: 'Analytics Insights', path: '/dashboard/analytics', icon: BarChart3 },
    { name: 'My Profile', path: '/dashboard/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen flex bg-github-lightBg dark:bg-github-bg transition-colors duration-200">
      
      {/* 1. Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" 
        />
      )}

      {/* 2. Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-github-lightBgSecondary dark:bg-github-bgSecondary border-r border-github-lightBorder dark:border-github-border transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-github-lightBorder dark:border-github-border">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-github-lightText dark:bg-github-blue rounded-lg text-white dark:text-github-bgHeader">
              <Github className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg text-github-lightText dark:text-white tracking-tight">Git DataHub</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 text-sm font-bold border-l-4 transition-all ${
                  isActive 
                    ? 'bg-github-lightBorder/40 dark:bg-github-bg text-github-lightText dark:text-white border-github-blue shadow-sm'
                    : 'text-github-lightTextMuted dark:text-github-textMuted border-transparent hover:bg-github-lightBg/50 dark:hover:bg-github-borderMuted hover:text-github-lightText dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        {user && (
          <div className="p-4 border-t border-github-lightBorder dark:border-github-border bg-github-lightBgSecondary/50 dark:bg-github-bgHeader/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-github-lightText/10 dark:bg-github-blue/10 text-github-lightText dark:text-github-blue flex items-center justify-center font-extrabold text-sm border border-github-lightBorder dark:border-github-border/30">
                {(user.name || 'C').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-github-lightText dark:text-white truncate">{user.name || 'User'}</p>
                <span className="inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wide bg-github-lightBorder dark:bg-github-border text-github-lightTextMuted dark:text-github-textMuted border border-github-lightBorder dark:border-github-border/50">
                  {user.role}
                </span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 dark:border-red-500/20 rounded-lg transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* 3. Main Frame Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 flex items-center justify-between px-6 bg-github-lightBg dark:bg-github-bgHeader border-b border-github-lightBorder dark:border-github-border flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white rounded-lg"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-bold uppercase tracking-wider text-github-lightTextMuted dark:text-github-textMuted hidden lg:block">System Workspace</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Light/Dark Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-github-lightTextMuted dark:text-github-textMuted hover:text-github-lightText dark:hover:text-white bg-github-lightBgSecondary dark:bg-github-bgSecondary hover:bg-github-lightBorder dark:hover:bg-github-border rounded-lg transition-all border border-github-lightBorder dark:border-github-border"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        {/* Dashboard Pages Main Scroll Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
